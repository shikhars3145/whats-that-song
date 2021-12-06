import { useState, useEffect } from "react";
import { deleteAudio } from "../handlers/recording-list";

import { v4 as uuid } from "uuid";

export default function useRecordingsList(audio) {
    const [recordings, setRecordings] = useState([]);
    function generateKey() {
        return uuid();
    }
    useEffect(() => {
        if (audio)
            setRecordings((prevState) => {
                return [...prevState, { key: generateKey(), audio }];
            });
    }, [audio]);

    return {
        recordings,
        deleteAudio: (audioKey) => deleteAudio(audioKey, setRecordings),
    };
}
