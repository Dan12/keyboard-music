/// <reference path="./soundpack.ts"/>

/**
 * a class that represents a song
 */
class Song {
  private name: string;

  private files: string[];

  /**
   * array of bpms and time steps
   * Invariant: must be at least of length 1 and the first cell must have timestamp 0
   */
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

  /**
   * @return the json representaion of this song
   */
  public constructJSON(): SongStruct {
    return {
      name: this.name,
      bpms: this.bpms,
      files: this.files,
      keyboard_type: KeyboardUtils.keyboardTypeToString(this.keyboardType),
      container_settings: this.getContainerSettings(),
      linked_areas: this.getLinkedAreas(),
      colors: null
    };
  }

  // get the container settings for the song json
  private getContainerSettings(): [number, (string|number)[][], boolean, number, boolean][][] {
    let ret = <[number, (string|number)[][], boolean, number, boolean][][]>[];
    for (let i = 0; i < this.soundPacks.length; i++) {
      ret.push(this.soundPacks[i].getContainersStruct());
    }
    return ret;
  }

  // get the lined areas for the song json
  private getLinkedAreas(): number[][][] {
    let ret = <number[][][]> [];
    for (let i = 0; i < this.soundPacks.length; i++) {
      ret.push(this.soundPacks[i].getLinkedAreas());
    }
    return ret;
  }

  /**
   * add a sound pack to this song at the end of the sound pack array
   */
  public addPack() {
    this.soundPacks.push(new SoundPack());
  }

  public getNumPacks(): number {
    return this.soundPacks.length;
  }

  /**
   * @return the soundpack at the given location. May return undefined.
   */
  public getPack(pack: number): SoundPack {
    return this.soundPacks[pack];
  }

  /**
   * add the given sound to the given pack at the given location.
   * Will create a container if none exists at the given location in the given pack
   */
  public addSound(pack: number, location: number, file: Sound) {
    // verify pack correctness
    if (pack >= 0 && pack < this.soundPacks.length) {
      // if the container does not yet exist, create it
      let container = this.soundPacks[pack].getContainer(location);
      if (container === undefined) {
        container = new SoundContainer();
        this.soundPacks[pack].addContainer(container, location);
      }

      container.addPitch(file);

      // get root file
      let rootFile = FileManager.getInstance().getRootLocation(file.getLoc().substring(0, file.getLoc().indexOf('/')));

      // add the root file to the song files array if it is not already in it
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

  /**
   * load a song from a file source using ajax. Call the callback function when done
   */
  public loadFromSource(location: string, callback: () => void) {
    $.getJSON(location, (data) => {
      this.loadSounds(data.files, () => {
        this.loadData(data);
        callback();
      });
    });
  }

  /**
   * load all of the sounds from the given list of urls. Call the callback when done loading the sounds
   */
  private loadSounds(urls: string[], callback: () => void) {
      let i = 0;

      let nextUrl = () => {
        i++;
        if (i >= urls.length) {
          console.log('Finished loading sounds');
          callback();
          return;
        }
        ZipHandler.requestZipLoad(urls[i], nextUrl);
      };

      ZipHandler.requestZipLoad(urls[i], nextUrl);
  }

  /**
   * load the song data from the given json data
   */
  private loadData(songData: SongStruct) {
    // load song variables
    this.bpms = songData['bpms'];
    this.name = songData['name'];
    this.files = songData['files'];
    this.keyboardType = KeyboardUtils.keyboardStringToType(songData['keyboard_type'].toUpperCase());

    // load the soundpacks
    for (let i = 0; i < songData['container_settings'].length; i++) {
      this.soundPacks.push(new SoundPack());

      // load the containers in the given soundpack
      for (let j = 0; j < songData['container_settings'][i].length; j++) {
        let data = songData['container_settings'][i][j];

        // format: location, pitches, hold to play, quaternize, loop
        let container = new SoundContainer(data[2], data[3], data[4]);

        // pitches format: [location, start time, end time]
        let pitches = data[1];
        for (let i = 0; i < pitches.length; i++) {
          // TODO verify correctness
          let loc = (<string> pitches[i][0]);
          let baseDir = loc.substring(0, loc.indexOf('/'));
          let fileLocation = loc.substring(loc.indexOf('/') + 1, loc.length);
          container.addPitch(FileManager.getInstance().getSound(baseDir, fileLocation), <number> pitches[i][1], <number> pitches[i][2]);
        }
        this.soundPacks[i].addContainer(container, data[0]);
      }

      // add the linked areas for this sound pack
      let linkedArea = songData['linked_areas'][i];
      for (let j = 0; j < linkedArea.length; j++) {
          let linkedNum = this.soundPacks[i].addLinkedArea();
          for (let k = 0; k < linkedArea[j].length; k++) {
            this.soundPacks[i].addToLinkedArea(linkedNum, linkedArea[j][k]);
          }
      }
    }
  }
}
