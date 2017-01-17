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

  private moveMap: {to: KeyboardKey, from: KeyboardKey}[];

  public static getInstance(): PayloadAlias {
    if (PayloadAlias.instance === undefined) {
      PayloadAlias.instance = new PayloadAlias();
    }

    return PayloadAlias.instance;
  }

  private constructor() {
    this.keys = {};
    this.moveMap = [];

    DomEvents.addListener(MousePayload.FINISHED_POPPING_EVENT, () => {
      this.flushMap();
    });
  }

  public clear() {
    this.keys = {};
    this.moveMap = [];
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
      SongManager.getSong().addSound(SongManager.getInstance().getCurrentSoundPack(), KeyboardUtils.getKeyLocation(key), sound);
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

  public addToMoveMap(from: KeyboardKey, to: KeyboardKey) {
    if (from.getKeyboard().getID() === this.songId && to.getKeyboard().getID() === this.songId)
      this.moveMap.push({to: to, from: from});
    else
      collectErrorMessage('Error: map from and to are not both from the map to keyboard');
  }

  public flushMap() {
    let tempMap: {to: KeyboardKey, container: SoundContainer, areas: number[]}[];
    tempMap = [];
    for (let i = 0; i < this.moveMap.length; i++) {
      let location = KeyboardUtils.getKeyLocation(this.moveMap[i].from);
      let container = SongManager.getCurrentPack().getContainer(location);
      let areas = SongManager.getCurrentPack().removeContainer(location);
      tempMap.push({to: this.moveMap[i].to, container: container, areas: areas});
    }

    for (let i = 0; i < tempMap.length; i++) {
      let loc = KeyboardUtils.getKeyLocation(tempMap[i].to);
      SongManager.getCurrentPack().setContainer(tempMap[i].container, loc);
      for (let j = 0; j < tempMap[i].areas.length; j++) {
        SongManager.getCurrentPack().addToLinkedArea(tempMap[i].areas[j], loc);
      }
      tempMap[i].to.setDefaultColor(100, 255, 100);
    }
    this.moveMap = [];
  }

  /**
   * get the container mapped to the given key if the key is on the map to keyboard.
   * Else, return undefined.
   */
  public getSongKey(key: KeyboardKey): SoundContainer {
    if (key.getKeyboard().getID() === this.songId) {
      return SongManager.getCurrentPack().getContainer(KeyboardUtils.getKeyLocation(key));
    } else {
      return undefined;
    }
  }
}
