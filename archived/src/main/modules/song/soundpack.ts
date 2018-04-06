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
  public getContainersStruct(): [number, (string|number)[][], boolean, number, boolean][] {
    let containers = <[number, (string|number)[][], boolean, number, boolean][]>[];
    for (let loc in this.sounds) {
      containers.push(
        [
          parseInt(loc),
          this.sounds[loc].getPitchLocations(),
          this.sounds[loc].getHoldToPlay(),
          this.sounds[loc].getQuaternize(),
          this.sounds[loc].getLoop()
        ]
      );
    }
    return containers;
  }

  /** @return the location-container map for this sound pack */
  public getContainers(): {[loc: number]: SoundContainer} {
    return this.sounds;
  }

  /** @return the linked areas for this soundpack */
  public getLinkedAreas(): number[][] {
    return this.linkedAreas;
  }

  /** called when this soundpack receives a press event at the given location */
  // TODO added linked area logic
  public pressed(loc: number) {
    let container = this.sounds[loc];
    if (container) {
      container.pressed();
    }

    // loop through all of the linked areas
    for (let i = 0; i < this.linkedAreas.length; i++) {
      for (let j = 0; j < this.linkedAreas[i].length; j++) {
        // if the i'th linked area contains the pressed location
        if (this.linkedAreas[i][j] === loc) {
          // loop over the i'th linked area and stop all other tracks
          for (j = 0; j < this.linkedAreas[i].length; j++) {
            if (this.linkedAreas[i][j] !== loc) {
              let stopContainer = this.sounds[this.linkedAreas[i][j]];
              if (stopContainer) {
                stopContainer.stop();
              }
            }
          }

          break;
        }
      }
    }
  }

  /** called when this soundpack receives a release event at the given location */
  public released(loc: number) {
    let container = this.sounds[loc];
    if (container) {
      container.released();
    }
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
   * remove the given location from the given linked area
   */
  public removeFromLinkedArea(area: number, location: number) {
    for (let i = 0; i < this.linkedAreas[area].length; i++) {
      if (this.linkedAreas[area][i] === location) {
        this.linkedAreas[area].splice(i, 1);
        break;
      }
    }
  }

  /**
   * set the map from the given location to the given sound container
   */
  public setContainer(container: SoundContainer, loc: number) {
    this.sounds[loc] = container;
  }

  /**
   * @return the sound container at the given location
   */
  public getContainer(loc: number): SoundContainer {
    return this.sounds[loc];
  }

  private getLocationLinkedAreas(loc: number): number[] {
    let ret = <number[]>[];
    for (let i = 0; i < this.linkedAreas.length; i++) {
      for (let j = 0; j < this.linkedAreas[i].length; j++) {
        if (this.linkedAreas[i][j] === loc) {
          ret.push(i);
        }
      }
    }
    return ret;
  }

  /** removes the container at the given location */
  public removeContainer(loc: number): number[] {
    delete this.sounds[loc];
    // remove the linked areas
    let areas = this.getLocationLinkedAreas(loc);
    for (let i = 0; i < areas.length; i++) {
      SongManager.getCurrentPack().removeFromLinkedArea(areas[i], loc);
    }
    return areas;
  }
}
