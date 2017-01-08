/// <reference path="./sound-container.ts"/>

class SoundPack {
  private sounds: {[loc: number]: SoundContainer};

  private linkedAreas: number[][];

  constructor() {
    this.sounds = {};

    this.linkedAreas = [];
  }

  public getContainers(): [number, (string|number)[][], boolean][] {
    let containers = <[number, (string|number)[][], boolean][]>[];
    for (let loc in this.sounds) {
      containers.push([parseInt(loc), this.sounds[loc].getPitchLocations(), false]);
    }
    return containers;
  }

  public getLinkedAreas(): number[][] {
    return this.linkedAreas;
  }

  public addLinkedArea(): number {
    this.linkedAreas.push([]);

    return this.linkedAreas.length - 1;
  }

  public addToLinkedArea(area: number, location: number) {
    this.linkedAreas[area].push(location);
  }

  public addContainer(container: SoundContainer, loc: number) {
    this.sounds[loc] = container;
  }

  public getContainer(loc: number) {
    return this.sounds[loc];
  }
}
