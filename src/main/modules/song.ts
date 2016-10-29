/// <reference path="./soundpack.ts"/>

class Song {
  private name: string;
  private bpms: number[];
  private soundPacks: SoundPack[];

  constructor(songData?: any, fileManager?: FileManager) {
    this.soundPacks = [];

    if (songData !== undefined && fileManager !== undefined) {
      this.loadPacks(songData, fileManager);
    }
  }

  private loadPacks(songData: any, fileManager: FileManager) {
    for (let i = 0; i < songData['soundpacks'].length; i++) {
      this.soundPacks.push(
        new SoundPack(songData['keyboard_type'].toUpperCase())
      );

      for (let j = 0; j < songData['container_settings'][i].length; j++) {
        this.soundPacks[i].addContainer()
      }
    }
  }
}
