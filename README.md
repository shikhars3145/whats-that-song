# Create and activate Virtual environment
```
python3 -m venv venv
source venv/bin/activate
```

# Install dependencies
python -m pip install -r requirements.txt

# Directory structure
put server/client files in respective folders

# Initial Setup
cd into the project root, type:
`python3 AudioMatch/setupDB.py`
to setup database file and create required tables

# How to use AudioMatch class methods:
Import AudioMatch class(from AudioMatch.py file) into your file where you are writing the api route functions
Might be helpful: https://www.geeksforgeeks.org/python-import-from-parent-directory/


Create a new Instance of audioMatch

```
audioMatch = AudioMatch()
```

To fingerprint all files in a directory
```
audioMatch.fingerprintAll('path')
ex: audioMatch.fingerprintAll('AudioMatch/mp3')
```

To fingerprint a single file (to be used in api)
```
audioMatch.fingerprintOne('path','filename')
ex: audioMatch.fingerprintOne('AudioMatch/mp3','Believer.mp3')
```

To Identify a wav file (to be used in api)
```
song = audioMatch.identifyWav('server/mp3/identify/lostinecho.wav')
```
it will return a object(song) that contains atleast these two keys that are to be retured to the client by the api
```
if song is found
{
    'SONG_NAME': '11 - Lost In The Echo.mp3', 
    'OFFSET_SECS': 71.23882
}

if song not found
{
    'SONG_NAME': 'Not Found', 
    'OFFSET_SECS': 0
}
```




