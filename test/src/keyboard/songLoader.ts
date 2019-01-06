class SongLoader extends DomElt {
  private numLoaded = 0;
  private numWaitingFor = 0;
  private name: string;
  private songName: string;

  constructor(name: string) {

    super("div", {class: "song-loader"}, "");

    this.name = name;

    Backend.getJSON(`resources/${this.name}/song.json`).then((song) => {
      Globals.BPM = song.bpm;
      this.songName = song.name;

      let sounds: Sound[][][] = Globals.defaultArr(
        [song.soundpacks.length, song.soundpacks[0].length, song.soundpacks[0][0].length],
        undefined);
      let playConfig: PadConfiguration[][][] = Globals.defaultArr(
        [song.soundpacks.length, song.soundpacks[0].length, song.soundpacks[0][0].length],
        PadConfiguration.NoConfig);

      for (let p = 0; p < song.soundpacks.length; p++) {
        // groups by pack
        let groups: {[id: number]: Sound[]} = {};
        for (let r = 0; r < song.soundpacks[p].length; r++) {
          for (let c = 0; c < song.soundpacks[p][r].length; c++) {
            this.waiting();
            this.loadSound(p, r, c, song.soundpacks[p][r][c], sounds, playConfig, groups);
          }
        }
      }

      Globals.midiConfig = new MidiConfiguration(sounds);
      Globals.playerConfig = new PlayConfiguration(playConfig);
    });

    Backend.getFileBlob(`resources/${this.name}/sounds.zip`).then((data) => {
      ZipHandler.loadFile(data, (name: string, data: ArrayBuffer) => {
        Globals.fromArray(data).then((audioBuf) => {
            SoundLibrary.addToLib(`${this.name}/${name}`, audioBuf);
        });
      });
    });
  }

  private waiting() {
    this.numWaitingFor++;
    this.updateLoadingText();
  }

  private updateLoadingText() {
    this.elt.innerHTML = `Loading ${this.songName}: ${this.numLoaded}/${this.numWaitingFor}`;
  }

  private loaded() {
    this.numLoaded++;
    this.updateLoadingText();
    if (this.numLoaded >= this.numWaitingFor) {
      this.elt.innerHTML = `Playing ${this.songName}`;
    }
  }

  private loadSound(
    p: number, r: number, c: number, sound: SoundJSON, sounds: Sound[][][],
    playConfig: PadConfiguration[][][], groups: {[id: number]: Sound[]}) {
    if (sound.pitches !== undefined && sound.pitches.length > 0) {
      // TODO handle more than 1 pitch
      SoundLibrary.getFromLib(`${this.name}/sounds/${sound.pitches[0]}`).then((audioBuf) => {
        let samp = new Sample(audioBuf, sound.loop);
        let s = new Sound(samp);
        let sGroups: Sound[] = [];
        // TODO handle more than 1 group
        // for (let group of sound.groups) {
        //   if (!(group in groups)) {
        //     groups[group] = [];
        //   }
        //   groups[group].push(s);
        //   sGroups.push(groups[group]);
        // }
        if (sound.groups.length > 0) {
          if (sound.groups.length > 1) {
            console.log("Warning: more than 1 group");
          }
          let group = sound.groups[0];
          if (!(group in groups)) {
            groups[group] = [];
          }
          groups[group].push(s);
          sGroups = groups[group];
        }
        let padConf = new PadConfiguration(sound.hold_to_play, sound.loop, sound.quantization, sGroups);

        sounds[p][r][c] = s;
        playConfig[p][r][c] = padConf;
        this.loaded();
      });
    } else {
      this.loaded();
    }
  }
}