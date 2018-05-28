class SoundLibrary {
  public static sounds: any = {};

  public static addToLib(path: string, data: AudioBuffer) {
    if (this.sounds[path] === undefined) {
      this.sounds[path] = data;
    } else {
      (this.sounds[path] as (value?: any) => void)(data);
      this.sounds[path] = data;
    }
  }

  public static getFromLib(path: string): Promise<AudioBuffer> {
    if (this.sounds[path] !== undefined) {
      return new Promise((resolve, reject) => {
        resolve(this.sounds[path]);
      });
    } else {
      return new Promise((resolve, reject) => {
        this.sounds[path] = resolve;
      });
    }
  }
}