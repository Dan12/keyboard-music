/// <reference path="./sound.ts"/>

/**
 * a container class for a single key's sound. Can contain multiple sounds in the form of pitches.
 */
class SoundContainer {
  public pitches: Sound[];
  public looped: boolean;
  public quaternized: number;
  public holdToPlay: boolean;

  constructor(hold_to_play?: boolean, quaternized?: number, looped?: boolean) {
    this.pitches = [];
    this.looped = looped === undefined ? false : looped;
    this.quaternized = quaternized === undefined ? 0 : quaternized;
    this.holdToPlay = hold_to_play === undefined ? false : hold_to_play;
  }

  /**
   * @return an array of all of the pitches in the format of pitch data: [location, start time, end time]
   */
  public getPitchLocations(): (string|number)[][] {
    let ret = <(string|number)[][]>[];
    for (let i = 0; i < this.pitches.length; i++) {
      ret.push(this.pitches[i].toArr());
    }
    return ret;
  }

  public addPitch(sound: Sound, start_time?: number, end_time?: number) {
    let options = {
      start_time: start_time,
      end_time: end_time,
      loop: this.looped
    };
    this.pitches.push(new Sound(sound, options));
  }

  public pressed() {
    if (this.pitches.length > 0)
      this.pitches[0].play();
  }

  public released() {
    if (this.pitches.length > 0)
      this.pitches[0].stop();
  }
}
