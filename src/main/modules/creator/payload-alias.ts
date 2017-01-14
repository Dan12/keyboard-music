/**
 * storage to connect keys in a keyboard to a sound file outside of the song.
 * primarily separated because the creator has 2 keyboards, with only one linked to the sounds
 */
class PayloadAlias {
  /** map from the keyboard id to a map from key locations to sound files */
  private keys: {[location: number]: Sound};
  private squareId: number;
  private songId: number;

  private static instance: PayloadAlias;

  public static getInstance(): PayloadAlias {
    if (PayloadAlias.instance === undefined) {
      PayloadAlias.instance = new PayloadAlias();
    }

    return PayloadAlias.instance;
  }

  private constructor() {
    this.keys = {};
  }

  public clear() {
    this.keys = {};
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
      return this.keys[this.getKeyLocation(key)];
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
      let location = this.getKeyLocation(key);
      let container = SongManager.getCurrentPack().getContainer(location);
      if (container === undefined) {
        container = new SoundContainer();
        SongManager.getCurrentPack().addContainer(container, location);
      }

      container.addPitch(sound);
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
      SongManager.getCurrentPack().addContainer(container, this.getKeyLocation(key));
    } else {
      collectErrorMessage('Error: key is not in map to keyboard');
    }
  }

  /**
   * get the container mapped to the given key if the key is on the map to keyboard.
   * Else, return undefined
   */
  public getSongKey(key: KeyboardKey): SoundContainer {
    if (key.getKeyboard().getID() === this.songId) {
      return SongManager.getCurrentPack().getContainer(this.getKeyLocation(key));
    } else {
      return undefined;
    }
  }

  private getKeyLocation(key: KeyboardKey): number {
    return KeyboardUtils.gridToLinear(key.getRow(), key.getCol(), key.getKeyboard().getNumCols());
  }
}
