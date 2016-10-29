/// <reference path="./soundpack.ts"/>

class Song {
  private name: string;
  private bpms: number[];
  private soundPacks: SoundPack[];
  private ready: boolean;

  constructor(location: string, fileManager: FileManager) {
    this.soundPacks = [];
    this.ready = false;

    $.getJSON(location, (data) => {
      loadSounds(data.files, fileManager, () => {
        console.log(fileManager);
        console.log(data);
        this.loadPacks(data, fileManager);
      });
    });
  }

  private loadPacks(songData: any, fileManager: FileManager) {
    for (let i = 0; i < songData['container_settings'].length; i++) {
      this.soundPacks.push(
        new SoundPack(songData['keyboard_type'].toUpperCase())
      );

      for (let j = 0; j < songData['container_settings'][i].length; j++) {
        let data = songData['container_settings'][i][j];

        // format: location, pitches, hold to play, quaternize, loop
        // pitches: [location, start time, end time]
        let container = new SoundContainer(data[2], data[3], data[4]);

        let pitches = data[1];
        for (let i = 0; i < pitches.length; i++) {
          container.addPitches(fileManager.getSound(pitches[i][0]), pitches[i][1], pitches[i][2]);
        }
        this.soundPacks[i].addContainer(container, data[0]);
      }
    }
  }
}
