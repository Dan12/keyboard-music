/// <reference path="./soundpack.ts"/>
/// <reference path="./sound-loader.ts"/>

class Song {
  private name: string;

  // array of bpm and time steps
  // Invariant: must be at least of length 1 and the first cell must have timestamp 0
  private bpms: number[][];

  private soundPacks: SoundPack[];

  // TODO keyboard type
  // TODO to json

  constructor() {
    this.soundPacks = [];

    // default bpm
    this.bpms = [[140, 0]];

    this.name = 'Untitled';
  }

  public addPack() {
    this.soundPacks.push(new SoundPack());
  }

  public getNumPacks(): number {
    return this.soundPacks.length;
  }

  public getPack(pack: number): SoundPack {
    return this.soundPacks[pack];
  }

  public addSound(pack: number, location: number, file: SoundFile) {
    if (pack >= 0 && pack < this.soundPacks.length) {
      let container = this.soundPacks[pack].getContainer(location);
      if (container === undefined) {
        container = new SoundContainer();
        this.soundPacks[pack].addContainer(container, location);
      }

      container.addPitch(file);
    } else {
      collectErrorMessage('Pack does not exists, ' + pack);
    }
  }

  public loadFromSource(location: string, callback: () => void) {
    $.getJSON(location, (data) => {
      loadSounds(data.files, () => {
        this.loadPacks(data);
        callback();
      });
    });
  }

  private loadPacks(songData: any) {
    for (let i = 0; i < songData['container_settings'].length; i++) {
      this.soundPacks.push(
        new SoundPack()
      );

      // keyboard size data
      // songData['keyboard_type'].toUpperCase()

      for (let j = 0; j < songData['container_settings'][i].length; j++) {
        let data = songData['container_settings'][i][j];

        // format: location, pitches, hold to play, quaternize, loop
        // pitches: [location, start time, end time]
        let container = new SoundContainer(data[2], data[3], data[4]);

        let pitches = data[1];
        for (let i = 0; i < pitches.length; i++) {
          // TODO verify correctness
          let baseDir = pitches[i][0].substring(0, pitches[i][0].indexOf('/'));
          let location = pitches[i][0].substring(pitches[i][0].indexOf('/') + 1, pitches[i][0].length);
          container.addPitch(FileManager.getInstance().getSound(baseDir, pitches[i][0]), pitches[i][1], pitches[i][2]);
        }
        this.soundPacks[i].addContainer(container, data[0]);
      }
    }
  }
}
