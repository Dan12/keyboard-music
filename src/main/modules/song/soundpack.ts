/// <reference path="./sound-container.ts"/>

/**
 * the soundpack class that contains the sound containers for this sound pack
 */
class SoundPack {
  private sounds: {[loc: number]: SoundContainer};

  private linkedAreas: number[][];

  constructor() {
    this.sounds = {};

    this.linkedAreas = [];
  }

  /**
   * @return the array representation of the sound containers in this sound pack
   */
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

  /**
   * add a linked area and return the linked area index
   */
  public addLinkedArea(): number {
    this.linkedAreas.push([]);

    return this.linkedAreas.length - 1;
  }

  /**
   * add the given location to the given linked area
   */
  public addToLinkedArea(area: number, location: number) {
    this.linkedAreas[area].push(location);
  }

  /**
   * add the given sound container to the soundpack at the given location
   */
  public addContainer(container: SoundContainer, loc: number) {
    this.sounds[loc] = container;
  }

  /**
   * @return the sound container at the given location
   */
  public getContainer(loc: number): SoundContainer {
    return this.sounds[loc];
  }
}
