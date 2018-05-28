/// <reference path="./globals.ts"/>
/// <reference path="../midi/sample.ts"/>
/// <reference path="./backend.ts"/>
/// <reference path="../IO/abstractIO.ts"/>
/// <reference path="../IO/keyboardIO.ts"/>
/// <reference path="../IO/defaultPadIO.ts"/>
/// <reference path="../IO/midiIO.ts"/>
/// <reference path="../zip.ts"/>
/// <reference path="../soundLib.ts"/>

/// <reference path="../domUtils.ts"/>
/// <reference path="../waveformAnalyzer.ts"/>

console.log("hello world");

// Initialization
let padIO = new DefaultPadIO();
KeyboardIO.instance.attachListener(padIO);
let midiIo = new MidiIO();
padIO.attachListener(midiIo);
Globals.midiConfig = new MidiConfiguration([]);
Globals.playerConfig = new PlayConfiguration([]);
Globals.BPM = 120;

let numLoaded = 0;
let numWaitingFor = 0;
function loaded() {
  numLoaded++;
  if (numLoaded >= numWaitingFor) {
    console.log("loaded");
  }
}

function loadSound(
  p: number, r: number, c: number, sound: SoundJSON, sounds: Sound[][][],
  playConfig: PadConfiguration[][][], groups: {[id: number]: Sound[]}) {
  if (sound.pitches !== undefined && sound.pitches.length > 0) {
    SoundLibrary.getFromLib("eq/sounds/" + sound.pitches[0]).then((audioBuf) => {
      let samp = new Sample(audioBuf, sound.loop);
      let s = new Sound(samp);
      let sGroups: Sound[] = [];
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
      loaded();
    });
  } else {
    loaded();
  }
}

Backend.getJSON("resources/eq/song.json").then((song) => {
  Globals.BPM = song.bpm;

  let sounds: Sound[][][] = Globals.defaultArr(
    [song.soundpacks.length, song.soundpacks[0].length, song.soundpacks[0][0].length],
    undefined);
  let playConfig: PadConfiguration[][][] = Globals.defaultArr(
    [song.soundpacks.length, song.soundpacks[0].length, song.soundpacks[0][0].length],
    undefined);

  for (let p = 0; p < song.soundpacks.length; p++) {
    // groups by pack
    let groups: {[id: number]: Sound[]} = {};
    for (let r = 0; r < song.soundpacks[p].length; r++) {
      for (let c = 0; c < song.soundpacks[p][r].length; c++) {
        numWaitingFor++;
        loadSound(p, r, c, song.soundpacks[p][r][c], sounds, playConfig, groups);
      }
    }
  }

  Globals.midiConfig = new MidiConfiguration(sounds);
  Globals.playerConfig = new PlayConfiguration(playConfig);
});

// Backend.getFileBlob("resources/eq/sounds.zip").then((data) => {
//   ZipHandler.loadFile(data, (name: string, data: ArrayBuffer) => {
//     Globals.fromArray(data).then((audioBuf) => {
//         SoundLibrary.addToLib("eq/" + name, audioBuf);
//     });
//   });
// });

let body = document.getElementsByTagName("body")[0];
let analyze = new WaveformAnalyzer();
body.appendChild(analyze.getElt());
Backend.getAsAudioBuffer("resources/eq/sounds/chain1/a0.mp3").then((data: ArrayBuffer) => {
  Globals.fromArray(data).then((audioBuf) => {
    console.log("setting");
    analyze.setBuffer(audioBuf);
  });
});

class AnalyzeIO extends AbstractIO<KeyboardMessage, void> {
  public receiveMessage(msg: KeyboardMessage) {
    if (msg.keyCode === 32 && msg.direction === KeyDirection.DOWN) {
      analyze.pressSpace();
    }
  }
}
KeyboardIO.instance.attachListener(new AnalyzeIO);

// TEST
// let myArrayBuffer = ctx.createBuffer(2, ctx.sampleRate * 3, ctx.sampleRate);

// for (let channel = 0; channel < myArrayBuffer.numberOfChannels; channel++) {
//   // This gives us the actual array that contains the data
//   let nowBuffering = myArrayBuffer.getChannelData(channel);
//   for (let i = 0; i < myArrayBuffer.length; i++) {
//     // audio needs to be in [-1.0; 1.0]
//     nowBuffering[i] = (Math.sin(i / 20) * Math.sin(i / 50)) * Math.exp(-i / 20000);
//   }
// }

// let source = ctx.createBufferSource();

// // set the buffer in the AudioBufferSourceNode
// source.buffer = myArrayBuffer;

// // connect the AudioBufferSourceNode to the
// // destination so we can hear the sound
// source.connect(ctx.destination);

// // start the source playing
// source.start();