/// <reference path="./sound.ts"/>

/**
 * a container class for a single key's sound. Can contain multiple sounds in the form of pitches.
 * @class SoundContainer
 * @constructor
 */
class SoundContainer {
  private pitches: Sound[];
  private looped: boolean;
  private quaternized: boolean;
  private holdToPlay: boolean;

  constructor(pitches: Sound[], hold_to_play: boolean, looped: boolean, quaternized: boolean) {
    this.pitches = pitches;
    this.looped = looped === undefined ? false : looped;
    this.quaternized = quaternized === undefined ? false : quaternized;
    this.holdToPlay = hold_to_play === undefined ? false : hold_to_play;
  }
}
