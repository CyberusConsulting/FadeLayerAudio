# FadeLayerAudio

### Fade the volume of 4 audio sources over a specified amount of time


### NOTE: 
- The 4 audio sources do not have to be syncronized
- Each layer volume is faded regardless of the layers time index

### How it works:
You need to create the layerAudioGain[] objects by either using already existing gain nodes for each audio source or calling the AudioContext createGain() function<br>
Instead of using gain.setValueAtTime() and gain.linearRampToValueAtTime() we manually fade the audio using setInterval(). 
This allows us to play audio sources that aren't syncronized yet still fade together regardless of the time index of each source.<br>
