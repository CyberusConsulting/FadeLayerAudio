/* ---------------------------------------------------------------------------
Copyright:      Cyberus Consulting, (c) 2024
Name:           fadeLayerAudio.js
Description:    Fade the volume of 4 audio sources over a specified amount of time
Created:        09/01/2024

NOTES:
    - The 4 audio sources do not have to be syncronized
    - Each layer volume is faded regardless of the layers time index

TODO:
	Todo items are marked with a $$$ comment

Revisions:

--------------------------------------------------------------------------- */


//----------------------------------------------------------
// CYB's Audio Source Class
//----------------------------------------------------------
class CYBAudioSource {

  layerAudioGain = [ null, null, null, null ];
  layerVolumes   = [  1.0,  1.0,  1.0,  1.0 ];
  fadeToDuration = 0.5;
  fadeToIntervalTimeMs = 10;
  timer_fadeTo = null;
  
  // NOTE:
  // You need to create the layerAudioGain[] objects by either using already existing gain nodes for each audio source
  // or calling the AudioContext createGain() function
  //
  // Instead of using gain.setValueAtTime() and gain.linearRampToValueAtTime() we manually fade the audio using setInterval(). 
  // This allows us to play audio sources that aren't syncronized but still fade together regardless of the time index of each source.
  //
  
  //----------------------------------------------------------
  // Linear fade the gain volume for each layer to the specified volumes 
  // over the duration amount of time in fadeToIntervalTimeMs intervals
  //----------------------------------------------------------
  async fadeLayerAudioTo(volumes, duration=this.fadeToDuration) {

    try {

      this.resetFadeToTimer();
      
      // Create an array of volume differences for each audio layer
      let vol_diffs = [ 0.0 , 0.0, 0.0, 0.0 ];
      try {
        vol_diffs = [
          volumes[0] - this.layerAudioGain[0].gain.value,
          volumes[1] - this.layerAudioGain[1].gain.value,
          volumes[2] - this.layerAudioGain[2].gain.value,
          volumes[3] - this.layerAudioGain[3].gain.value
        ];
      } catch(err) { 
        console.error(`fadeLayerAudioTo(): ${err}`);
      }

      // Convert the duration to milliseconds and 
      // calculate the time delta needed for each step
      let duration_ms = (duration * 1000.0).toFixed(0); // Convert to milliseconds
      let time_step = this.fadeToIntervalTimeMs / duration_ms;
      let time_elapsed_ms = 0;

      // Kick off the interval
      this.timer_fadeTo = setInterval(function() {
        time_elapsed_ms += this.fadeToIntervalTimeMs;
        if (time_elapsed_ms <= duration_ms) {

          // Adjust volume for each layer and step
          try {
            this.layerAudioGain[0].gain.value += vol_diffs[0] * time_step;
            this.layerAudioGain[1].gain.value += vol_diffs[1] * time_step;
            this.layerAudioGain[2].gain.value += vol_diffs[2] * time_step;
            this.layerAudioGain[3].gain.value += vol_diffs[3] * time_step;
          } catch(err) { 
            console.error(`fadeLayerAudioTo(): ${err}`);
          }

        } else {
          this.resetFadeToTimer();
          // Make sure the final result is exactly what was supplied
          this.setAllLayerVolumesFromArray(volumes);
        }
      }.bind(this), this.fadeToIntervalTimeMs);

    } catch(err) { 
      console.error(`fadeLayerAudioTo(): ${err}`);
    }
  }
  
  //----------------------------------------------------------
  // Reset the fade timer
  //----------------------------------------------------------
  resetFadeToTimer() {

    if (this.timer_fadeTo) { clearInterval(this.timer_fadeTo); }
    this.timer_fadeTo = null;
  }
  
  //----------------------------------------------------------
  // This sets the gain value for each layer from the supplied volumes array
  // and makes sure there's no over/under flow of the values before
  // applying them to the gain nodes
  //----------------------------------------------------------
  setAllLayerVolumesFromArray(volumes) {

    try {
      if (volumes && (4 == volumes.length)) {
        this.layerVolumes[0] = volumes[0];
        this.layerVolumes[1] = volumes[1];
        this.layerVolumes[2] = volumes[2];
        this.layerVolumes[3] = volumes[3];
        if (this.layerVolumes[0] < 0.0) { this.layerVolumes[0] = 0.0; }
        if (this.layerVolumes[0] > 1.0) { this.layerVolumes[0] = 1.0; }
        if (this.layerVolumes[1] < 0.0) { this.layerVolumes[1] = 0.0; }
        if (this.layerVolumes[1] > 1.0) { this.layerVolumes[1] = 1.0; }
        if (this.layerVolumes[2] < 0.0) { this.layerVolumes[2] = 0.0; }
        if (this.layerVolumes[2] > 1.0) { this.layerVolumes[2] = 1.0; }
        if (this.layerVolumes[3] < 0.0) { this.layerVolumes[3] = 0.0; }
        if (this.layerVolumes[3] > 1.0) { this.layerVolumes[3] = 1.0; }
      }
    } catch(err) { 
      console.error(`setAllLayerVolumesFromArray(): ${err}`);
    }

    try {
      this.layerAudioGain[0].gain.value = this.layerVolumes[0];
      this.layerAudioGain[1].gain.value = this.layerVolumes[1];
      this.layerAudioGain[2].gain.value = this.layerVolumes[2];
      this.layerAudioGain[3].gain.value = this.layerVolumes[3];
    } catch(err) { 
      console.error(`setAllLayerVolumesFromArray(): ${err}`);
    }
  }
  