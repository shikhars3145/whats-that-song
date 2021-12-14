// import { ReactMic } from 'react-mic';
// import Pizzicato from 'pizzicato'
import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./components/Home";
import AudioCheck from "./components/AudioCheck";

// import { useState } from 'react';
// import PlayCircleOutlineIcon from '@mui/icons-material/PlayCircleOutline';
// import PauseCircleOutlineIcon from '@mui/icons-material/PauseCircleOutline';

function App() {
  // const [record, setRecord] = useState(false);
  // let chunks = [];

  // function onData(recordedBlob) {

  //   console.log("chunk of real-time data is:", recordedBlob);
  //   chunks.push(recordedBlob);
  //   // console.log(chunks);

  // }
  // function onStop(recordedBlob) {

  //   console.log("Recorded Blob is:", chunks);
  //   const blob = new Blob(chunks, { 'type': 'audio/wav;codecs=opus' });
  //   // chunks = [];
  //   const audioURL = window.URL.createObjectURL(blob);
  //   console.log(audioURL);
  //   // const sound = new Pizzicato.Sound({
  //   //   source: 'file',
  //   //   options: { path: [audioURL] }
  //   // }, () => {
  //   //   sound.play();
  //   // })

  // }
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/check" element={<AudioCheck />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

//wav
//sample rate 44100
