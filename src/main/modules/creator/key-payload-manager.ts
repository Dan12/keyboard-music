/**
 * storage to connect keys in a keyboard to a sound file outside of the song.
 * primarily separated because the creator has 2 keyboards, with only one linked to the sounds
 */
class KeyPayloadManager {
  /** map from the keyboard id to a map from key locations to sound files */
  private keys: {[keyboard: number]: {[location: number]: SoundContainer}};

  private static instance: KeyPayloadManager;

  public static getInstance(): KeyPayloadManager {
    if (KeyPayloadManager.instance === undefined) {
      KeyPayloadManager.instance = new KeyPayloadManager();
    }

    return KeyPayloadManager.instance;
  }

  private constructor() {
    this.keys = {};
  }

  public clear() {
    this.keys = {};
  }

  /**
   * clear a certain keyboard id
   * @param keyboardNum the keyboard id to clear
   */
  public clearKeyboard(keyboardNum: number) {
    this.keys[keyboardNum] = {};
  }

  /**
   * add a map from the given key to the given sound
   */
  public addSoundFromKey(key: KeyboardKey, sound: SoundContainer) {
    let location = KeyboardUtils.gridToLinear(key.getRow(), key.getCol(), key.getKeyboard().getNumCols());
    this.addKey(key.getKeyboard().getID(), location, sound);
  }

  /**
   * return the sound mapped to the given key
   */
  public getSoundFromKey(key: KeyboardKey): SoundContainer {
    let location = KeyboardUtils.gridToLinear(key.getRow(), key.getCol(), key.getKeyboard().getNumCols());
    return this.getKey(key.getKeyboard().getID(), location);
  }

  /**
   * add a map from the given location in the given keyboard to the given sound
   */
  public addKey(keyboard: number, location: number, sound: SoundContainer) {
    if (this.keys[keyboard] === undefined) {
      this.keys[keyboard] = {};
    }

    this.keys[keyboard][location] = sound;
  }

  /**
   * get the sound mapped to the given location in the given keyboard
   */
  public getKey(keyboard: number, location: number): SoundContainer {
    if (this.keys[keyboard])
      return this.keys[keyboard][location];

    return undefined;
  }
}
