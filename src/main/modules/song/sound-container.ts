/// <reference path="./sound.ts"/>

/**
 * a container class for a single key's sound. Can contain multiple sounds in the form of pitches.
 * @class SoundContainer
 * @constructor
 */
class SoundContainer {
  private pitches: Sound[];
  private looped: boolean;
  private quaternized: number;
  private holdToPlay: boolean;

  constructor(hold_to_play: boolean, quaternized: number, looped: boolean) {
    this.pitches = [];
    this.looped = looped === undefined ? false : looped;
    this.quaternized = quaternized === undefined ? 0 : quaternized;
    this.holdToPlay = hold_to_play === undefined ? false : hold_to_play;
  }

  public addPitches(sound: SoundFile, start_time: number, end_time: number) {
    this.pitches.push(new Sound(sound.name, sound.sound, this.looped, start_time, end_time));
  }
}
