/// <reference path="./song.ts"/>
/// <reference path="./song-struct.ts"/>

/**
 * a song manager class that provides a singleton interface to the current song
 */
class SongManager {

  private static instance: SongManager;

  private song: Song;

  private currentSoundPack: number;

  /**
   *  @return the singleton instance of this class
   */
  public static getInstance(): SongManager {
    if (SongManager.instance === undefined) {
      SongManager.instance = new SongManager();
    }

    return SongManager.instance;
  }

  private constructor() {
    this.currentSoundPack = 0;
  }

  /**
   * @return the json structure of the current song
   */
  public constructJSON(): SongStruct {
    return this.song.constructJSON();
  }

  /**
   * create a new song
   */
  public newSong(type: KeyBoardType) {
    // TODO check for save
    this.song = new Song(type);
    this.currentSoundPack = 0;
  }

  /**
   * load a song and set it to the current song.
   * @param location the location of the song
   * @param callback the callback function for when the song is finished loading
   */
  public loadSong(location: string, callback: () => void) {
    this.song = new Song(KeyBoardType.STANDARD);
    this.currentSoundPack = 0;
    this.song.loadFromSource(location, callback);
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

  /**
   * called from a keyboard when a key is pressed at the given location
   */
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

  /**
   * called from a keyboard when a key is released at the given location
   */
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
