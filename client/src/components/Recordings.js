// import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
// import { faTrashAlt, faExclamationCircle } from "@fortawesome/free-solid-svg-icons";
import ErrorIcon from '@mui/icons-material/Error';
import Typography from '@mui/material/Typography';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import useRecordingsList from "../hooks/useRecordingList";


export default function RecordingsList({ audio }) {
    const { recordings, deleteAudio } = useRecordingsList(audio);
    console.log(recordings);
    return (
        <div className="recordings-container">
            {recordings.length > 0 ? (
                <>
                    <Typography id="modal-modal-title" variant="h6" component="h2" textAlign="center">
                        Your Recordings
                    </Typography>
                    <div className="recordings-list">
                        {recordings.map((record) => (
                            <div className="record" key={record.key}>

                                <audio controls src={record.audio} />
                                <div className="delete-button-container">
                                    <button
                                        className="delete-button"
                                        title="Delete this audio"
                                        onClick={() => deleteAudio(record.key)}
                                    >
                                        <DeleteForeverIcon />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </>
            ) : (
                <div className="no-records">
                    <ErrorIcon />
                    <span>You don't have records</span>
                </div>
            )}
        </div>
    );
}
