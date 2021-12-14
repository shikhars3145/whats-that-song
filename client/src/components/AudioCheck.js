import React, { useEffect, useState } from "react";

const initial = {
  leftchannel: [],
  rightchannel: [],
  recorder: null,
  recordingLength: 0,
  volume: null,
  mediaStream: null,
  sampleRate: 44100,
  context: null,
  blob: null,
};

function AudioCheck() {
  const [open, setopen] = useState(false);
  const [recordState, setrecordState] = useState(initial);
  console.log("Runnnn>>>>>>>>>>>>>>>>>>>", open, recordState);
  var bufferSize = 2048;
  var numberOfInputChannels = 2;
  var numberOfOutputChannels = 2;
  function flattenArray(channelBuffer, recordingLength) {
    var result = new Float32Array(recordingLength);
    var offset = 0;
    for (var i = 0; i < channelBuffer.length; i++) {
      var buffer = channelBuffer[i];
      result.set(buffer, offset);
      offset += buffer.length;
    }
    return result;
  }

  function interleave(leftChannel, rightChannel) {
    var length = leftChannel.length + rightChannel.length;
    var result = new Float32Array(length);

    var inputIndex = 0;

    for (var index = 0; index < length; ) {
      result[index++] = leftChannel[inputIndex];
      result[index++] = rightChannel[inputIndex];
      inputIndex++;
    }
    return result;
  }

  function writeUTFBytes(view, offset, string) {
    for (var i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i));
    }
  }
  useEffect(() => {
    if (recordState.context) {
      console.log(recordState);
      if (recordState.context.createScriptProcessor) {
        // recorder = context.createScriptProcessor(
        //   bufferSize,
        //   numberOfInputChannels,
        //   numberOfOutputChannels
        // );
        setrecordState((prevState) => {
          return {
            ...prevState,
            recorder: prevState.context.createScriptProcessor(
              bufferSize,
              numberOfInputChannels,
              numberOfOutputChannels
            ),
          };
        });
      } else {
        // recorder = context.createJavaScriptNode(
        //   bufferSize,
        //   numberOfInputChannels,
        //   numberOfOutputChannels
        // );
        setrecordState((prevState) => {
          return {
            ...prevState,
            recorder: prevState.context.createJavaScriptNode(
              bufferSize,
              numberOfInputChannels,
              numberOfOutputChannels
            ),
          };
        });
      }
    }
  }, [recordState.context]);
  useEffect(() => {
    if (recordState.recorder) {
      recordState.recorder.onaudioprocess = function (e) {
        // leftchannel.push(new Float32Array(e.inputBuffer.getChannelData(0)));
        // rightchannel.push(new Float32Array(e.inputBuffer.getChannelData(1)));
        // recordingLength += bufferSize;
        setrecordState((prevState) => {
          return {
            ...prevState,
            leftchannel: [
              ...prevState.leftchannel,
              new Float32Array(e.inputBuffer.getChannelData(0)),
            ],
            rightchannel: [
              ...prevState.rightchannel,
              new Float32Array(e.inputBuffer.getChannelData(1)),
            ],
            recordingLength: prevState.recordingLength + bufferSize,
          };
        });
      };
    }
    if (recordState.recorder && recordState.context) {
      recordState.recorder.connect(recordState.context.destination);
    }
  }, [recordState.recorder]);
  useEffect(() => {
    if (recordState.mediaStream && recordState.recorder) {
      recordState.mediaStream.connect(recordState.recorder);
    }
  }, [recordState.mediaStream]);
  function startRecording() {
    setopen(true);
    console.log("start");
    navigator.getUserMedia =
      navigator.getUserMedia ||
      navigator.webkitGetUserMedia ||
      navigator.mozGetUserMedia ||
      navigator.msGetUserMedia;
    navigator.getUserMedia(
      {
        audio: true,
      },
      function (e) {
        console.log("user consent");

        // creates the audio context
        window.AudioContext = window.AudioContext || window.webkitAudioContext;
        // context = new AudioContext();
        setrecordState((prevState) => {
          return {
            ...prevState,
            context: new AudioContext(),
          };
        });

        // creates an audio node from the microphone incoming stream
        // mediaStream = context.createMediaStreamSource(e);
        setrecordState((prevState) => {
          return {
            ...prevState,
            mediaStream: prevState.context.createMediaStreamSource(e),
          };
        });

        // https://developer.mozilla.org/en-US/docs/Web/API/AudioContext/createScriptProcessor
        // bufferSize: the onaudioprocess event is called when the buffer is full

        // console.log(recordState);

        // we connect the recorder
      },
      function (e) {
        console.error(e);
      }
    );
  }
  useEffect(() => {
    console.log(recordState.blob);
  }, [recordState.blob]);

  function stopRecording() {
    console.log("stopped");
    setopen(false);
    recordState.recorder.disconnect(recordState.context.destination);
    recordState.mediaStream.disconnect(recordState.recorder);

    // we flat the left and right channels down
    // Float32Array[] => Float32Array
    var leftBuffer = flattenArray(
      recordState.leftchannel,
      recordState.recordingLength
    );
    var rightBuffer = flattenArray(
      recordState.rightchannel,
      recordState.recordingLength
    );
    // we interleave both channels together
    // [left[0],right[0],left[1],right[1],...]
    var interleaved = interleave(leftBuffer, rightBuffer);

    // we create our wav file
    var buffer = new ArrayBuffer(44 + interleaved.length * 2);
    var view = new DataView(buffer);

    // RIFF chunk descriptor
    writeUTFBytes(view, 0, "RIFF");
    view.setUint32(4, 44 + interleaved.length * 2, true);
    writeUTFBytes(view, 8, "WAVE");
    // FMT sub-chunk
    writeUTFBytes(view, 12, "fmt ");
    view.setUint32(16, 16, true); // chunkSize
    view.setUint16(20, 1, true); // wFormatTag
    view.setUint16(22, 2, true); // wChannels: stereo (2 channels)
    view.setUint32(24, recordState.sampleRate, true); // dwSamplesPerSec
    view.setUint32(28, recordState.sampleRate * 4, true); // dwAvgBytesPerSec
    view.setUint16(32, 4, true); // wBlockAlign
    view.setUint16(34, 16, true); // wBitsPerSample
    // data sub-chunk
    writeUTFBytes(view, 36, "data");
    view.setUint32(40, interleaved.length * 2, true);

    // write the PCM samples
    var index = 44;
    var volume = 1;
    for (var i = 0; i < interleaved.length; i++) {
      view.setInt16(index, interleaved[i] * (0x7fff * volume), true);
      index += 2;
    }

    // our final blob
    // blob = new Blob([view], { type: "audio/wav" });
    setrecordState((prevState) => {
      return {
        ...prevState,
        blob: new Blob([view], { type: "audio/wav" }),
      };
    });
    // console.log(recordState.blob);
  }
  function play() {
    if (recordState.blob == null) {
      return;
    }

    var url = window.URL.createObjectURL(recordState.blob);
    var audio = new Audio(url);
    audio.play();
  }
  // async function download() {
  //   if (blob == null) {
  //     return;
  //   }

  //   var url = URL.createObjectURL(blob);
  //   const file = await fetch(url)
  //     .then((r) => r.blob())
  //     .then(
  //       (blobFile) =>
  //         new File([blobFile], Date.now() + ".wav", { type: "audio/wav" })
  //     );
  //   if (file) {
  //     const data = new FormData();
  //     const fileName = Date.now() + file.name;
  //     data.append("name", fileName);
  //     data.append("file", file);
  //     axios.post("http://localhost:5000/uploadRecording", data).then((res) => {
  //       console.log(res);
  //     });
  //   }
  //   // var a = document.createElement("a");
  //   // document.body.appendChild(a);
  //   // a.style = "display: none";
  //   // a.href = url;
  //   // a.download = "sample.wav";
  //   // a.click();
  //   // window.URL.revokeObjectURL(url);
  // }
  return (
    <div>
      <h1>Audio</h1>
      {open ? (
        <button id="stopRecordingButton" onClick={stopRecording}>
          Stop recording
        </button>
      ) : (
        <button id="startRecordingButton" onClick={startRecording}>
          Start recording
        </button>
      )}

      <button id="playButton" onClick={play}>
        Play
      </button>
      {/* <button id="downloadButton" onClick={download}>
        Download
      </button> */}
    </div>
  );
}

export default AudioCheck;
