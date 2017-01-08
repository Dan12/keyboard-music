/// <reference path="./song.ts"/>
/// <reference path="./song-struct.ts"/>

class SongManager {

  private static instance: SongManager;

  private song: Song;

  private currentSoundPack: number;

  public static getInstance(): SongManager {
    if (SongManager.instance === undefined) {
      SongManager.instance = new SongManager();
    }

    return SongManager.instance;
  }

  private constructor() {
    this.currentSoundPack = 0;
  }

  public constructJSON(): SongStruct {
    return this.song.constructJSON();
  }

  public newSong(type: KeyBoardType) {
    // TODO check for save
    this.song = new Song(type);
    this.currentSoundPack = 0;
  }

  public static getSong(): Song {
    return SongManager.getInstance().song;
  }

  public static getCurrentPack(): SoundPack {
    return SongManager.getInstance().song.getPack(SongManager.getInstance().currentSoundPack);
  }

  public setSoundPack(pack: number) {
    this.currentSoundPack = pack;
  }

  public getCurrentSoundPack(): number {
    return this.currentSoundPack;
  }

  public pressedKey (location: number) {
    if (this.song) {
      let pack = this.song.getPack(this.currentSoundPack);
      if (pack) {
        let container = pack.getContainer(location);
        if (container) {
          container.pressed();
        }
      }
    }
  }

  public releasedKey(location: number) {
    if (this.song) {
      let pack = this.song.getPack(this.currentSoundPack);
      if (pack) {
        let container = pack.getContainer(location);
        if (container) {
          container.released();
        }
      }
    }
  }

}
