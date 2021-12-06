# read all files from a given directory and add to db
# read a single file and add to db
# read from single file and compare
# read from microphone and compare
import os
import time
import numpy as np
import wavio
from itertools import zip_longest
from models.FileReader import FileReader
from models.SqliteDatabase import  SqliteDatabase
import models.Fingerprint as Fingerprint
from models.MicReader import MicrophoneReader

class AudioMatch:
    def __init__(self):
        self.db = SqliteDatabase()

    def fingerprintOne(self, path,filename):
        reader = FileReader(path+'/'+filename)
        audio = reader.parse_audio()

        song = self.db.get_song_by_filehash(audio['file_hash'])

        song_id = self.db.add_song(filename,audio['file_hash'])

        if song:
            hash_count = self.db.get_song_hashes_count(song_id)

            if hash_count > 0:
                print('song already exists ')
                return
            
        print('new song, going to analyze..')

        hashes = set()
        channel_amount = len(audio['channels'])

        for channeln, channel in enumerate(audio['channels']):
            channel_hashes = Fingerprint.fingerprint(channel, Fs=audio['Fs'])
            channel_hashes = set(channel_hashes)

            hashes |= channel_hashes
        
        print('song Fingerprinting finished')

        values = []

        for hash, offset in hashes:
            values.append((song_id,hash, offset))

        self.db.store_fingerprints(values)


    def fingerprintAll(self, path):
        for filename in os.listdir(path):
            if filename.endswith(".mp3"):
                self.fingerprintOne(path,filename)
        
        print("Directory fingerprinted")
    

    def identifyMic(self,seconds=5):
        chunksize = 2**12  # 4096
        channels = 2 #int(config['channels']) # 1=mono, 2=stereo
        reader = MicrophoneReader()

        reader.start_recording(seconds=seconds,
        chunksize=chunksize,
        channels=channels)

        print("Listening Started")

        
        bufferSize = int(reader.rate / reader.chunksize * seconds) # 44100/4096 * 5 = 53.8 # ARE THESE TOTAL SLICES IN THE SPECTROGRAM? NO THIS IS THE NUMBER OF TIMES WE HAVE TO RUN LOOP TO PROCESS ALL THE CHUNKS CAPTURED IN 5 seconds, this and the below loop should have been inside the process recording instead of executing that function these many times

        for i in range(0, bufferSize):
            nums = reader.process_recording()

            msg = 'processing %d of %d..' % (i, bufferSize)
            print(msg)

        reader.stop_recording()

        msg = ' * recording has been stopped'
        
        print(msg)

        # After recording is stopped reader.data should be a list of 2 lists, 1 for each channel having the waveform of that channel, just like pydub after reading files

        data = reader.get_recorded_data()

        msg = ' * recorded %d samples'
        
        print(msg % len(data[0]))
        return self.identifyStream(data)


    def identifyStream(self,data):
        t0 = time.time()
        Fs = Fingerprint.DEFAULT_FS
        channel_amount = len(data)

        result = set()
        matches = []

        def grouper(iterable, n, fillvalue=None):
            args = [iter(iterable)] * n
            return (filter(None, values) for values
                    in zip_longest(fillvalue=fillvalue, *args))

        def find_matches(samples, Fs=Fingerprint.DEFAULT_FS):
            hashes = Fingerprint.fingerprint(samples, Fs=Fs)
            return return_matches(hashes)

        def return_matches(hashes):
            mapper = {}
            for hash, offset in hashes:
                mapper[hash.upper()] = offset
            values = mapper.keys()

            for split_values in grouper(values, 1000):
                # @todo move to db related files
                query = """
                    SELECT upper(hash), song_fk, offset
                    FROM fingerprints
                    WHERE upper(hash) IN (%s)
                """
                split_values = list(split_values)

                query = query % ', '.join('?' * len(split_values))
                print(query)
                x = self.db.executeAll(query, split_values)
                matches_found = len(x)

                if matches_found > 0:
                    msg = '   ** found %d hash matches (step %d/%d)'
                    print(msg % (
                    matches_found,
                    len(split_values),
                    len(values)
                    ))
                else:
                    msg = '   ** not matches found (step %d/%d)'
                    print(msg % (
                    len(list(split_values)),
                    len(values)
                    ))

                for hash, sid, offset in x:
                    yield (sid, offset - mapper[hash])
                
        for channeln, channel in enumerate(data):
            # TODO: Remove prints or change them into optional logging.
            msg = '   fingerprinting channel %d/%d'
            print(msg % (channeln+1, channel_amount))

            matches.extend(find_matches(channel))

            msg = '   finished channel %d/%d, got %d hashes'
            print(msg % (
                channeln+1, channel_amount, len(matches)
            ))


        def align_matches(matches):
            diff_counter = {}
            largest = 0
            largest_count = 0
            song_id = -1

            for tup in matches:
                sid, diff = tup

                if diff not in diff_counter:
                    diff_counter[diff] = {}

                if sid not in diff_counter[diff]:
                    diff_counter[diff][sid] = 0

                diff_counter[diff][sid] += 1

                if diff_counter[diff][sid] > largest_count:
                    largest = diff
                    largest_count = diff_counter[diff][sid]
                    song_id = sid

            songM = self.db.get_song_by_id(song_id)

            nseconds = round(float(largest) / Fingerprint.DEFAULT_FS *
                     Fingerprint.DEFAULT_WINDOW_SIZE *
                     Fingerprint.DEFAULT_OVERLAP_RATIO, 5)


            return {
            "SONG_ID" : song_id,
            "SONG_NAME" : songM[1],
            "CONFIDENCE" : largest_count,
            "OFFSET" : int(largest),
            "OFFSET_SECS" : nseconds
            }
        
        total_matches_found = len(matches)

        print ('')

        if total_matches_found > 0:
            msg = ' ** totally found %d hash matches'
            print (msg % total_matches_found)

            song = align_matches(matches)

            msg = ' => song: %s (id=%d)\n'
            msg += '    offset: %d (%d secs)\n'
            msg += '    confidence: %d'
            print("time taken",time.time()-t0)
            print (msg % (
            song['SONG_NAME'], song['SONG_ID'],
            song['OFFSET'], song['OFFSET_SECS'],
            song['CONFIDENCE']
            ))
            return song
        else:
            msg = ' ** not matches found at all'
            print (msg)
            return {'SONG_NAME':'Not Found', 'OFFSET_SECS':0}

    def identifyWav(self, path):
        # fs, _, audiofile = wavio.read(path)
        wv = wavio.read(path)
        print(wv)
        data = wv.data
        # limit=10
        channel = [[],[]]


        for frame in data:
            channel[0].append(frame[0])
            channel[1].append(frame[1])
        
        return self.identifyStream(channel)



if __name__ == '__main__':
    audioMatch = AudioMatch()
    # audioMatch.fingerprintAll('AudioMatch/mp3')
    song = audioMatch.identifyMic()
    # song = audioMatch.identifyWav('server/mp3/identify/lostinecho.wav')
    # audioMatch.fingerprintOne('AudioMatch/mp3','Believer.mp3')
    print(song)

        

