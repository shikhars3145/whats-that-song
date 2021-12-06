import React from 'react';

import MicIcon from '@mui/icons-material/Mic';
import PauseCircleFilledIcon from '@mui/icons-material/PauseCircleFilled';
import CancelIcon from '@mui/icons-material/Cancel';


function Recorder({ recorderState, handlers }) {
    const { recordingMinutes, recordingSeconds, initRecording } = recorderState;
    const { startRecording, saveRecording, cancelRecording } = handlers;
    function formatMinutes(minutes) {
        return minutes < 10 ? `0${minutes}` : minutes;
    }

    function formatSeconds(seconds) {
        return seconds < 10 ? `0${seconds}` : seconds;
    }
    return (
        <div className="controls-container">
            <div className="recorder-display">
                <div className="recording-time">
                    {initRecording && <div className="recording-indicator"></div>}
                    <span>{formatMinutes(recordingMinutes)}</span>
                    <span>:</span>
                    <span>{formatSeconds(recordingSeconds)}</span>
                </div>
                {initRecording && (
                    <div className="cancel-button-container">
                        <button className="cancel-button" title="Cancel recording" onClick={cancelRecording}>
                            <CancelIcon />
                        </button>
                    </div>
                )}
            </div>
            <div className="start-button-container">
                {initRecording ? (
                    <button
                        className="start-button"
                        title="Pause recording"
                        disabled={recordingSeconds === 0}
                        onClick={saveRecording}
                    >
                        <PauseCircleFilledIcon />
                    </button>
                ) : (
                    <button className="start-button" title="Start recording" onClick={startRecording}>
                        <MicIcon />
                    </button>
                )}
            </div>


        </div>
    );
}

export default Recorder
