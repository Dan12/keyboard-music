class KeyPayloadManager {
  private keys: {[keyboard: number]: {[location: number]: SoundFile}};

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

  public addSoundFromKey(key: KeyboardKey, sound: SoundFile) {
    let location = KeyboardUtils.gridToLinear(key.getRow(), key.getCol(), key.getKeyboard().getNumCols());
    this.addKey(key.getKeyboard().getID(), location, sound);
  }

  public getSoundFromKey(key: KeyboardKey): SoundFile {
    let location = KeyboardUtils.gridToLinear(key.getRow(), key.getCol(), key.getKeyboard().getNumCols());
    return this.getKey(key.getKeyboard().getID(), location);
  }

  public addKey(keyboard: number, location: number, sound: SoundFile) {
    if (this.keys[keyboard] === undefined) {
      this.keys[keyboard] = {};
    }

    this.keys[keyboard][location] = sound;
  }

  public getKey(keyboard: number, location: number): SoundFile {
    if (this.keys[keyboard])
      return this.keys[keyboard][location];

    return undefined;
  }
}
