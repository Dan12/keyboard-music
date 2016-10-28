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

  constructor() {}
}
