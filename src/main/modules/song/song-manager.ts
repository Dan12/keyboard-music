/// <reference path="./song.ts"/>

class SongManager {

  private static instance: SongManager;

  private song: Song;

  public static getInstance(): SongManager {
    if (SongManager.instance === undefined) {
      SongManager.instance = new SongManager();
    }

    return SongManager.instance;
  }

  private constructor() {
    this.song = new Song();
  }

  public pressedKey () {
    // TODO
  }

  public releasedKey() {
    // TODO
  }

}
