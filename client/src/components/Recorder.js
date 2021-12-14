import React, { useEffect, useState } from "react";

import MicIcon from "@mui/icons-material/Mic";
import CancelOutlinedIcon from "@mui/icons-material/CancelOutlined";
import PauseIcon from "@mui/icons-material/Pause";

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
  recordingMinutes: 0,
  recordingSeconds: 0,
};

function Recorder({audio,setAudio}) {
  const [open, setopen] = useState(false);
  const [recordState, setrecordState] = useState(initial);
  
  // console.log("Runnnn>>>>>>>>>>>>>>>>>>>", open, recordState);
  var bufferSize = 2048;
  var numberOfInputChannels = 2;
  var numberOfOutputChannels = 2;

  useEffect(() => {
    // const MAX_RECORDER_TIME = 5;
    let recordingInterval = null;

    if (open) {
      recordingInterval = setInterval(() => {
        // console.log(recordState.recordingSeconds)
        setrecordState((prevState) => {
          

          if (
            prevState.recordingSeconds >= 0 &&
            prevState.recordingSeconds < 59
          ){

            // console.log("time inc");
            return {
              ...prevState,
              recordingSeconds: prevState.recordingSeconds + 1,
            };
          }

          if (prevState.recordingSeconds === 59)
            return {
              ...prevState,
              recordingMinutes: prevState.recordingMinutes + 1,
              recordingSeconds: 0,
            };
        });
      }, 1000);
    } else clearInterval(recordingInterval);

    return () => clearInterval(recordingInterval);
  },[open]);
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
      // console.log(recordState);
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
    if(recordState.blob){
      var url = window.URL.createObjectURL(recordState.blob);
      setAudio(url);
    }
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
  function cancelRecording() {
    setrecordState(initial);
    setopen(false);
    console.log("cancelled");
  }
  function formatMinutes(minutes) {
    return minutes < 10 ? `0${minutes}` : minutes;
  }
  // function play() {
  //   if (recordState.blob == null) {
  //     return;
  //   }

  //   var url = window.URL.createObjectURL(recordState.blob);
  //   var audio = new Audio(url);
  //   audio.play();
  // }
  function formatSeconds(seconds) {
    return seconds < 10 ? `0${seconds}` : seconds;
  }
  return (
    <div className="controls-container">
      <div className="recorder-display">
        <div className="recording-time">
          {open && <div className="recording-indicator"></div>}
          <span>{formatMinutes(recordState.recordingMinutes)}</span>
          <span>:</span>
          <span>{formatSeconds(recordState.recordingSeconds)}</span>
        </div>
        <div>
          {open && (
            <div className="cancel-button-container">
              <button
                className="cancel-button"
                title="Cancel recording"
                onClick={cancelRecording}
              >
                <CancelOutlinedIcon />
              </button>
            </div>
          )}
        </div>
      </div>
      <div className="start-button-container">
        {open ? (
          <button
            className="start-button"
            title="Pause recording"
            onClick={stopRecording}
          >
            <PauseIcon />
          </button>
        ) : (
          <button
            className="start-button"
            title="Start recording"
            onClick={startRecording}
          >
            <MicIcon sx={{ textAlign: "center" }} />
          </button>
        )}
      </div>
      {/* <button onClick={play}>Play</button> */}
    </div>
  );
}

export default Recorder;
