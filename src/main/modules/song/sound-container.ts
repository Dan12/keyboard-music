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

  /** @return a copy of this sound container */
  public copy(): SoundContainer {
    let ret = new SoundContainer(this.holdToPlay, this.quaternized, this.looped);
    for (let i  = 0; i < this.pitches.length; i++) {
      ret.addPitch(this.pitches[i]);
    }
    return ret;
  }

  /** @return the value of hold to play for this container */
  public getHoldToPlay(): boolean {
    return this.holdToPlay;
  }

  public setHoldToPlay(value: boolean) {
    this.holdToPlay = value;
  }

  /** @return the value of loop for this container */
  public getLoop(): boolean {
    return this.looped;
  }

  public setLoop(value: boolean) {
    this.looped = value;
    for (let i = 0; i < this.pitches.length; i++) {
      this.pitches[i].setLoop(this.looped);
    }
  }

  /** @return the pitches in this container */
  public getPitches(): Sound[] {
    return this.pitches;
  }

  /** @return the quaternize value for this container */
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

  /**
   * add the given sound as a pitch to this container
   * @param sound the sound to add
   * @param start_time the optional start time to initlize with
   * @param end_time the optional end time to initlize this sound with
   */
  public addPitch(sound: Sound, start_time?: number, end_time?: number) {
    let options = {
      start_time: start_time,
      end_time: end_time,
      loop: this.looped
    };
    this.pitches.push(new Sound(sound, options));
  }

  /** remove the pitch at the given index from this container */
  public removePitch(ind: number) {
    this.pitches.splice(ind, 1);
  }

  /** called when this container receives a press event */
  public pressed() {
    if (this.pitches.length > 0) {
      // if looping, toggle play and pause on the first pitch
      if (this.looped) {
        this.currentPitch = 0;
        this.previousPitch = 0;
        if (this.pitches[this.currentPitch].playing()) {
          this.pitches[this.currentPitch].stop();
        } else {
          this.pitches[this.currentPitch].play();
        }
      } else {
        // else stop the previousPitch and play the next one
        this.pitches[this.previousPitch].stop();
        this.pitches[this.currentPitch].play();

        this.previousPitch = this.currentPitch;
        this.currentPitch++;
        this.currentPitch = this.currentPitch % this.pitches.length;
      }
    }
  }

  /** called when this container receives a release event. Only stops the previous pitch if holdToPlay is on */
  public released() {
    if (this.pitches.length > 0 && this.holdToPlay) {
      this.pitches[this.previousPitch].stop();
    }
  }

  /** stops the previous pitch no matter what */
  public stop() {
    if (this.pitches.length > 0) {
      this.pitches[this.previousPitch].stop();
    }
  }
}
