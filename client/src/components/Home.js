import * as React from 'react';
import Modal from '@mui/material/Modal';

import Typography from '@mui/material/Typography';
import { Button, Input } from '@mui/material';
import Recorder from './Recorder';
import useRecorder from '../hooks/useRecorder';
import RecordingsList from './Recordings';
import axios from 'axios';



function Home() {
    const [openFile, setOpenFile] = React.useState(false);
    const [openRecorder, setOpenRecorder] = React.useState(false);
    const { recorderState, ...handlers } = useRecorder();
    const [file, setFile] = React.useState(null)
    const { audio } = recorderState;

    function handleUpload() {
        console.log(file);
        const data = new FormData();
        const fileName = Date.now() + file.name;
        data.append("name", fileName);
        data.append("file", file);
        axios.post("http://localhost:5000/uploadFile", data)
            .then(res => {
                console.log(res);
            })

    }
    function handleRecordings() {
        console.log(audio);

        if (audio) {
            const data = {
                audio: audio
            }
            axios.post("http://localhost:5000/uploadRecording", data)
                .then(res => {
                    console.log(res);
                })
        }
        else {

        }
    }

    return (
        <div className="home">
            <div className="home__heading">
                <h2>What's The Song</h2>
            </div>
            <div className="home__buttons">
                <button onClick={() => setOpenRecorder(true)}>Recognise from clip</button>
                <button onClick={() => setOpenFile(true)}>Add audio to database</button>
            </div>
            <Modal
                open={openFile}
                onClose={() => setOpenFile(false)}
                aria-labelledby="modal-modal-title"
                aria-describedby="modal-modal-description"
            >
                <div className="home__modal">
                    <Typography id="modal-modal-title" variant="h6" component="h2" textAlign="center">
                        Add a File
                    </Typography>
                    <Input type="file" onChange={(e) => setFile(e.target.files[0])}></Input>
                    <Button variant="contained" onClick={handleUpload}>Upload</Button>
                </div>
            </Modal>
            <Modal
                open={openRecorder}
                onClose={() => setOpenRecorder(false)}
                aria-labelledby="modal-modal-title"
                aria-describedby="modal-modal-description"
            >
                <div className="home__modal">
                    <Typography id="modal-modal-title" variant="h6" component="h2" textAlign="center">
                        Record an Audio
                    </Typography>
                    <Recorder recorderState={recorderState} handlers={handlers} />
                    <RecordingsList audio={audio} />
                    <Button variant="contained" onClick={handleRecordings}>Upload</Button>
                </div>
            </Modal>
        </div >
    )
}

export default Home
