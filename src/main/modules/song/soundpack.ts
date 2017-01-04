/// <reference path="./sound-container.ts"/>

class SoundPack {
  private sounds: {[loc: number]: SoundContainer};

  private linkedAreas: number[][];

  constructor() {
    this.sounds = {};
  }

  public addContainer(container: SoundContainer, loc: number) {
    this.sounds[loc] = container;
  }

  public getContainer(loc: number) {
    return this.sounds[loc];
  }
}
