import * as React from 'react';
import Modal from '@mui/material/Modal';

import Typography from '@mui/material/Typography';
import { Button, Input } from '@mui/material';
import Recorder from './Recorder';
import useRecorder from '../hooks/useRecorder';
import RecordingsList from './Recordings';
import Alert from '@mui/material/Alert';
import MicIcon from '@mui/icons-material/Mic';
import axios from 'axios';



function Home() {
    const [openFile, setOpenFile] = React.useState(false);
    const [openRecorder, setOpenRecorder] = React.useState(false);
    const { recorderState, ...handlers } = useRecorder();
    const [file, setFile] = React.useState(null)
    const [message, setmessage] = React.useState(null);
    const { audio } = recorderState;

    function handleUpload() {
        console.log(file);
        if(file){
            const data = new FormData();
        const fileName = Date.now() + file.name;
        data.append("name", fileName);
        data.append("file", file);
        axios.post("http://localhost:5000/uploadFile", data)
            .then(res => {
                console.log("res", res);
            })
        }
        else{
            setmessage("Please select a file");
        }
        

    }
    async function handleRecordings() {
        console.log(audio);

        if (audio) {
            const file = await fetch(audio).then(r => r.blob()).then(blobFile => new File([blobFile], Date.now() + ".wav", { type: "audio/wav" }));
            if (file) {
                const data = new FormData();
                const fileName = Date.now() + file.name;
                data.append("name", fileName);
                data.append("file", file);
                axios.post("http://localhost:5000/uploadRecording", data)
                    .then(res => {
                        console.log(res);
                    })
            }
            

        }
        else{
            setmessage("Please record an audio");
        }
    }

    return (
        <div className="home">
            <div className="home__heading">
                <h2>What's That Song</h2>
            </div>
            <div className="home__buttons">
                <button variant="contained" onClick={() => setOpenRecorder(true)} className='btn btn--shockwave is-active'><MicIcon sx={{fontSize:"5rem",color:"#1976d2",position:"relative",top:"1.5rem"}}/></button>
                <Button onClick={() => setOpenFile(true)}>Add audio to database</Button>
            </div>
            
            <Modal
                open={openFile}
                onClose={() => {setOpenFile(false);setmessage(null)}}
                aria-labelledby="modal-modal-title"
                aria-describedby="modal-modal-description"
            >
               
                <div className="home__modal">
                {message?<Alert  onClose={()=>{setmessage(null)}}severity="error">{message}</Alert>:null}
                    <Typography id="modal-modal-title" variant="h6" component="h2" textAlign="center">
                        Add a File
                    </Typography>
                    <Input type="file" onChange={(e) => setFile(e.target.files[0])}></Input>
                    <Button variant="contained" onClick={handleUpload}>Upload</Button>
                </div>
                
            </Modal>
            <Modal
                open={openRecorder}
                onClose={() => {setOpenRecorder(false);setmessage(null)}}
                aria-labelledby="modal-modal-title"
                aria-describedby="modal-modal-description"
            >
                <div className="home__modal">
                {message?<Alert  onClose={()=>{setmessage(null)}}severity="error">{message}</Alert>:null}
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
