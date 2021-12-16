import * as React from 'react';
import Modal from '@mui/material/Modal';

import Typography from '@mui/material/Typography';
import { Button, Input } from '@mui/material';
import Recorder from './Recorder';
// import useRecorder from '../hooks/useRecorder';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import MicIcon from '@mui/icons-material/Mic';
import axios from 'axios';



function Home() {
    const [openFile, setOpenFile] = React.useState(false);
    const [openRecorder, setOpenRecorder] = React.useState(false);
    // const { recorderState, ...handlers } = useRecorder();
    const [result, setResult] = React.useState(false);
    const [details, setDetails] = React.useState("No Such Song Found")
    const [file, setFile] = React.useState(null)
    const [message, setmessage] = React.useState(null);
    const [audio, setAudio] = React.useState(null);
    const [loading,setLoading]=React.useState(false);
    const [successMessage, setSuccessMessage] = React.useState(null)
    // const { audio } = recorderState;
    // console.log(audio);
    React.useEffect(() => {
        let newDetail=details.replace(/_/g," ");
        setDetails(newDetail);
    }, [details])
    function handleUpload() {
        // console.log(file);
        if(file){
            setLoading(true);
            const data = new FormData();
        const fileName = Date.now() + file.name;
        data.append("name", fileName);
        data.append("file", file);
        console.time('File Upload')
        axios.post("http://localhost:5000/uploadFile", data)
            .then(res => {
                console.log("res", res);
                setLoading(false);
                setOpenFile(false);
                setSuccessMessage("File Uploaded Successfully");
                console.timeEnd('File Upload')

            })
        }
        else{
            setmessage("Please select a file");
        }
        

    }
    async function handleRecordings() {
        // console.log(audio);

        if (audio) {
            setLoading(true);
            const file = await fetch(audio).then(r => r.blob()).then(blobFile => new File([blobFile], Date.now() + ".wav", { type: "audio/wav" }));
            if (file) {
                const data = new FormData();
                const fileName = Date.now() + file.name;
                data.append("name", fileName);
                data.append("file", file);
                console.time('Recognise')
    
                axios.post("http://localhost:5000/uploadRecording", data)
                    .then(res => {
                        console.log(res);
                        setLoading(false);
                        setDetails(res.data.SONG_NAME);
                        setOpenRecorder(false);
                        setResult(true);
                        setSuccessMessage("WOHOO!! We Got Your Song");
                        console.timeEnd('Recognise')

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
                {loading && <CircularProgress sx={{position:"absolute",top:"40%",left:"45%"}}/>}
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
                {loading && <CircularProgress sx={{position:"absolute",top:"40%",left:"45%"}}/>}
                    <Typography id="modal-modal-title" variant="h6" component="h2" textAlign="center">
                        Record an Audio
                    </Typography>
                    <Recorder audio={audio} setAudio={setAudio}/>
                    <Button variant="contained" onClick={handleRecordings}>Upload</Button>
                </div>
            </Modal>
            <Modal
                open={result}
                onClose={() => {setResult(false);}}
                aria-labelledby="modal-modal-title"
                aria-describedby="modal-modal-description"
            >
                <div className="home__modal">
                
                    <Typography id="modal-modal-title" variant="h6" component="h2" textAlign="center">
                    WOOHH!!! Here's Your Song
                    </Typography>
                    <p className="home__result">
                        {details}
                    </p>
                    
                </div>
            </Modal>
            {successMessage?<Alert sx={{position:"absolute",top:"0",right:"0"}} onClose={()=>{setSuccessMessage(null)}}severity="success">{successMessage}</Alert>:null}
        </div >
    )
}

export default Home
