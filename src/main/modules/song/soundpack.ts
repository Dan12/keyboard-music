/// <reference path="./sound-container.ts"/>

class SoundPack {
  private sounds: {[loc: number]: SoundContainer};

  private linkedAreas: number[][];

  constructor() {
    this.sounds = {};
  }

  public getContainers(): [number, string[][], boolean][] {
    let containers = <[number, string[][], boolean][]>[];
    for (let loc in this.sounds) {
      containers.push([parseInt(loc), [['']], false]);
    }
    return containers;
  }

  public getLinkedAreas(): number[][] {
    return this.linkedAreas;
  }

  public addContainer(container: SoundContainer, loc: number) {
    this.sounds[loc] = container;
  }

  public getContainer(loc: number) {
    return this.sounds[loc];
  }
}
