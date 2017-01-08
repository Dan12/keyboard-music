/// <reference path="./soundpack.ts"/>
/// <reference path="./sound-loader.ts"/>

class Song {
  private name: string;

  private files: string[];

  // array of bpm and time steps
  // Invariant: must be at least of length 1 and the first cell must have timestamp 0
  private bpms: number[][];

  private soundPacks: SoundPack[];

  private keyboardType: KeyBoardType;

  constructor(type: KeyBoardType) {
    this.keyboardType = type;

    this.soundPacks = [];

    // default bpm
    this.bpms = [[140, 0]];

    this.name = 'Untitled';

    this.files = [];
  }

  public constructJSON(): SongStruct {
    return {
      name: this.name,
      bpms: this.bpms,
      files: this.files,
      keyboard_type: KeyboardUtils.KeyboardTypeToString(this.keyboardType),
      container_settings: this.getContainerSettings(),
      linked_areas: this.getLinkedAreas(),
      colors: null
    };
  }

  private getContainerSettings(): [number, (string|number)[][], boolean][][] {
    let ret = <[number, (string|number)[][], boolean][][]>[];
    for (let i = 0; i < this.soundPacks.length; i++) {
      ret.push(this.soundPacks[i].getContainers());
    }
    return ret;
  }

  private getLinkedAreas(): number[][][] {
    let ret = <number[][][]> [];
    for (let i = 0; i < this.soundPacks.length; i++) {
      ret.push(this.soundPacks[i].getLinkedAreas());
    }
    return ret;
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

      // get root file
      let rootFile = FileManager.getInstance().getRootLocation(file.location.substring(0, file.location.indexOf('/')));

      if (this.files.length === 0) {
        this.files.push(rootFile);
      } else {
        for (let i = 0; i < this.files.length; i++) {
          if (this.files[i] === rootFile) {
            break;
          }
          if (i === this.files.length - 1) {
            this.files.push(rootFile);
          }
        }
      }
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
