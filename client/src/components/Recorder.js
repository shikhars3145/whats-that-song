import React from 'react';

import MicIcon from '@mui/icons-material/Mic';
import PauseCircleFilledIcon from '@mui/icons-material/PauseCircleFilled';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
import PauseIcon from '@mui/icons-material/Pause';


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
                <div>
                {initRecording && (
                    <div className="cancel-button-container">
                        <button className="cancel-button" title="Cancel recording" onClick={cancelRecording}>
                            <CancelOutlinedIcon />
                        </button>
                    </div>
                )}
                </div>
            </div>
            <div className="start-button-container">
                {initRecording ? (
                    <button
                        className="start-button"
                        title="Pause recording"
                        disabled={recordingSeconds === 0}
                        onClick={saveRecording}
                    >
                        <PauseIcon />
                    </button>
                ) : (
                    <button className="start-button" title="Start recording" onClick={startRecording}>
                        <MicIcon sx={{textAlign:"center"}} />
                    </button>
                )}
            </div>


        </div>
    );
}

export default Recorder
