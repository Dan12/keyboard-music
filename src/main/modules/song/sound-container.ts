/// <reference path="./sound.ts"/>

/**
 * a container class for a single key's sound. Can contain multiple sounds in the form of pitches.
 */
class SoundContainer {
  private pitches: Sound[];
  private looped: boolean;
  private quaternized: number;
  private holdToPlay: boolean;

  private currentPitch: number;
  private previousPitch: number;

  constructor(hold_to_play?: boolean, quaternized?: number, looped?: boolean) {
    this.pitches = [];
    this.looped = looped === undefined ? false : looped;
    this.quaternized = quaternized === undefined ? 0 : quaternized;
    this.holdToPlay = hold_to_play === undefined ? false : hold_to_play;

    this.currentPitch = 0;
    this.previousPitch = 0;
  }

  public getHoldToPlay(): boolean {
    return this.holdToPlay;
  }

  public setHoldToPlay(value: boolean) {
    this.holdToPlay = value;
  }

  public getLoop(): boolean {
    return this.looped;
  }

  public setLoop(value: boolean) {
    this.looped = value;
    for (let i = 0; i < this.pitches.length; i++) {
      this.pitches[i].setLoop(this.looped);
    }
  }

  public getPitches(): Sound[] {
    return this.pitches;
  }

  public getQuaternize() {
    return this.quaternized;
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

  public removePitch(ind: number) {
    this.pitches.splice(ind, 1);
  }

  public pressed() {
    if (this.pitches.length > 0) {
      if (this.looped) {
        this.currentPitch = 0;
        if (this.pitches[this.currentPitch].playing()) {
          this.pitches[this.currentPitch].stop();
        } else {
          this.pitches[this.currentPitch].play();
        }
      } else {
        this.pitches[this.previousPitch].stop();
        this.pitches[this.currentPitch].play();

        this.previousPitch = this.currentPitch;
        this.currentPitch++;
        this.currentPitch = this.currentPitch % this.pitches.length;
      }
    }
  }

  public released() {
    if (this.pitches.length > 0 && this.holdToPlay) {
      this.pitches[this.currentPitch].stop();
    }
  }
}
