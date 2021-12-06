import { useState, useEffect } from "react";
import { startRecording, saveRecording } from "../handlers/recorder-controls";

const initialState = {
    recordingMinutes: 0,
    recordingSeconds: 0,
    initRecording: false,
    mediaStream: null,
    mediaRecorder: null,
    audio: null,
};

export default function useRecorder() {
    const [recorderState, setRecorderState] = useState(initialState);

    useEffect(() => {
        const MAX_RECORDER_TIME = 5;
        let recordingInterval = null;

        if (recorderState.initRecording)
            recordingInterval = setInterval(() => {
                setRecorderState((prevState) => {
                    if (
                        prevState.recordingMinutes === MAX_RECORDER_TIME &&
                        prevState.recordingSeconds === 0
                    ) {
                        clearInterval(recordingInterval);
                        return prevState;
                    }

                    if (prevState.recordingSeconds >= 0 && prevState.recordingSeconds < 59)
                        return {
                            ...prevState,
                            recordingSeconds: prevState.recordingSeconds + 1,
                        };

                    if (prevState.recordingSeconds === 59)
                        return {
                            ...prevState,
                            recordingMinutes: prevState.recordingMinutes + 1,
                            recordingSeconds: 0,
                        };
                });
            }, 1000);
        else clearInterval(recordingInterval);

        return () => clearInterval(recordingInterval);
    });

    useEffect(() => {
        if (recorderState.mediaStream) {
            var options = {

                mimeType: 'audio/webm'
            }
            setRecorderState((prevState) => {
                return {
                    ...prevState,
                    mediaRecorder: new MediaRecorder(prevState.mediaStream, options),
                };
            });
            // const recordMedia = recorderState.mediaStream;


        }



    }, [recorderState.mediaStream]);

    useEffect(() => {
        const recorder = recorderState.mediaRecorder;
        console.log(recorder);
        let chunks = [];


        if (recorder && recorder.state === "inactive") {
            recorder.start(5000);

            recorder.ondataavailable = (e) => {

                chunks.push(e.data);
            };

            recorder.onstop = () => {
                const blob = new Blob(chunks, { type: "audio/wav; codecs=opus" });
                console.log(blob);
                console.log("Audio", chunks);
                console.log("File is", window.URL.createObjectURL(blob));
                chunks = [];

                setRecorderState((prevState) => {
                    if (prevState.mediaRecorder)
                        return {
                            ...initialState,
                            audio: window.URL.createObjectURL(blob),
                        };
                    else return initialState;
                });
            };
        }

        return () => {
            if (recorder) recorder.stream.getAudioTracks().forEach((track) => track.stop());
        };
    }, [recorderState.mediaRecorder]);

    return {
        recorderState,
        startRecording: () => startRecording(setRecorderState),
        cancelRecording: () => setRecorderState(initialState),
        saveRecording: () => saveRecording(recorderState.mediaRecorder),
    };
}
