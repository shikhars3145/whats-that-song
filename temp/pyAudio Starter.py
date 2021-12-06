import pyaudio

audio = pyaudio.PyAudio()
stream = None

rate = 44100 # sampling freq
format = pyaudio.paInt16 # bit depth
# each second the value of soundwave amplitude is 
# captured and sampled/quantised in values ranging from -32000 to 32000 (16 bit int)

print(format)
channels = 2
input = True # use stream as input
# output = True # use stream as output
frames_per_buffer = # also called chunk sometimes,
                    # signifies number of frequency ranges/bins
                    # and is equal to half of fft size

stream = audio.open() #parameters of stream

stream.start_stream()

stream.close()
