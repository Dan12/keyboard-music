/**
 * acts as a alias for the sounds and sound containers linked to the keyboard keys.
 * provides storage for the temporary square keyboard sounds
 * and provides an interface into the song's containers for the map to keyboard
 */
class PayloadAlias {
  /** map from key locations to sound files */
  private keys: {[location: number]: Sound};

  // the keyboard ids to verify a keyboard key on the method
  private squareId: number;
  private songId: number;

  private static instance: PayloadAlias;

  // private tempSoundContainers: {[location: number]: {container: SoundContainer, areas: number[]}};

  public static getInstance(): PayloadAlias {
    if (PayloadAlias.instance === undefined) {
      PayloadAlias.instance = new PayloadAlias();
    }

    return PayloadAlias.instance;
  }

  private constructor() {
    this.keys = {};
    // this.tempSoundContainers = {};
  }

  public clear() {
    this.keys = {};
    // this.tempSoundContainers = {};
  }

  /**
   * register the square keyboard id. Must be done before any other actions
   */
  public registerSquareKeyboard(id: number) {
    this.squareId = id;
  }

  /**
   * register the map to keyboard id. Must be done before any other actions
   */
  public registerSongId(id: number) {
    this.songId = id;
  }

  /**
   * add a map from the key to the given sound.
   * Will only work if the key is in the square keyboard
   */
  public addSquareKey(key: KeyboardKey, sound: Sound) {
    if (key.getKeyboard().getID() === this.squareId) {
      let location = KeyboardUtils.gridToLinear(key.getRow(), key.getCol(), key.getKeyboard().getNumCols());
      this.keys[location] = new Sound(sound, {});
    } else {
      collectErrorMessage('Error: key is not in square keyboard');
    }
  }

  /**
   * get the sound mapped to the given key if the key is on the square keyboard.
   * Else, return undefined
   */
  public getSquareKey(key: KeyboardKey): Sound {
    if (key.getKeyboard().getID() === this.squareId) {
      return this.keys[KeyboardUtils.getKeyLocation(key)];
    } else {
      return undefined;
    }
  }

  /**
   * add a map from the key to the given sound by adding the sound to the song.
   * Will only work if the key is in the map to keyboard
   */
  public addSongKey(key: KeyboardKey, sound: Sound) {
    if (key.getKeyboard().getID() === this.songId) {
      let location = KeyboardUtils.getKeyLocation(key);
      SongManager.getSong().addSound(SongManager.getInstance().getCurrentSoundPack(), location, sound);
    } else {
      collectErrorMessage('Error: key is not in map to keyboard');
    }
  }

  /**
   * add a map from the key to the given container by adding the container to the song.
   * Will only work if the key is in the map to keyboard
   */
  public setSongContainer(key: KeyboardKey, container: SoundContainer) {
    if (key.getKeyboard().getID() === this.songId) {
      SongManager.getSong().setContainer(
        SongManager.getInstance().getCurrentSoundPack(),
        KeyboardUtils.getKeyLocation(key), container
      );
    } else {
      collectErrorMessage('Error: key is not in map to keyboard');
    }
  }

  // public getSongAreas(key: KeyboardKey): number[] {
  //   if (key.getKeyboard().getID() === this.songId) {
  //     let dataObj = this.tempSoundContainers[KeyboardUtils.getKeyLocation(key)];
  //     if (dataObj)
  //       return dataObj.areas;
  //     else
  //       return undefined;
  //   } else {
  //     return undefined;
  //   }
  // }

  /**
   * get the container mapped to the given key if the key is on the map to keyboard.
   * Else, return undefined.
   */
  public getSongKey(key: KeyboardKey): SoundContainer {
    if (key.getKeyboard().getID() === this.songId) {
      let location = KeyboardUtils.getKeyLocation(key);
      // if (this.tempSoundContainers[location] !== undefined) {
      //   let ret = this.tempSoundContainers[location].container;
      //
      //   if (finalDestination)
      //     delete this.tempSoundContainers[location];
      //
      //   return ret;
      // } else
        return SongManager.getCurrentPack().getContainer(location);
    } else {
      return undefined;
    }
  }

  /**
   * called when the given key is about to become the mouse payload.
   * Gives the appearance of moving the song key by removing it from its curent place in the song
   * and storing it in a temporary object.
   */
  // public checkAndMoveSongKey(key: KeyboardKey): SoundContainer {
  //   if (key.getKeyboard().getID() === this.songId) {
  //     let location = KeyboardUtils.getKeyLocation(key);
  //     let ret = SongManager.getCurrentPack().getContainer(location);
  //
  //     let areas = SongManager.getCurrentPack().removeContainer(location);
  //
  //     if (ret !== undefined) {
  //       this.tempSoundContainers[location] = {container: ret, areas: areas};
  //       key.setDefaultColor();
  //     }
  //
  //     return ret;
  //   } else {
  //     return undefined;
  //   }
  // }
}
