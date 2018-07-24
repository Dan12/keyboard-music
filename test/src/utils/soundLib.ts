class SoundLibrary {
  public static sounds: any = {};

  /**
   * Adds the data to the sound library at the given path.
   * If there is a promise for it resolve with the promise
   * first and then set.
   * @param path the path of the data
   * @param data the data
   */
  public static addToLib(path: string, data: AudioBuffer) {
    if (this.sounds[path] === undefined) {
      this.sounds[path] = data;
    } else {
      for (let resolve of this.sounds[path]) {
        (resolve as (value?: any) => void)(data);
      }
      this.sounds[path] = data;
    }
  }

  /**
   * Returns a promise that is resolved when the sound has been loaded
   * @param path The sound to access
   */
  public static getFromLib(path: string): Promise<AudioBuffer> {
    if (this.sounds[path] !== undefined) {
      if (this.sounds[path] instanceof Array) {
        return new Promise((resolve, reject) => {
          this.sounds[path].push(resolve);
        });
      } else {
        return new Promise((resolve, reject) => {
          resolve(this.sounds[path]);
        });
      }
    } else {
      return new Promise((resolve, reject) => {
        this.sounds[path] = [resolve];
      });
    }
  }
}