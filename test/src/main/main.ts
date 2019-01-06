/// <reference path="./globals.ts"/>
/// <reference path="../midi/sample.ts"/>
/// <reference path="./backend.ts"/>
/// <reference path="../IO/abstractIO.ts"/>
/// <reference path="../IO/keyboardIO.ts"/>
/// <reference path="../IO/defaultPadIO.ts"/>
/// <reference path="../IO/midiIO.ts"/>
/// <reference path="../utils/zip.ts"/>
/// <reference path="../utils/soundLib.ts"/>

/// <reference path="../utils/domUtils.ts"/>
/// <reference path="../waveform/waveformDisplay.ts"/>
/// <reference path="../waveform/audioSplitter.ts"/>
/// <reference path="../waveform/analyzeIO.ts"/>
/// <reference path="../waveform/audioAnalyzer.ts"/>

/// <reference path="../player/player.ts"/>
/// <reference path="../player/playerEventHandler.ts"/>

/// <reference path="../keyboard/keyboard.ts"/>
/// <reference path="../keyboard/keyboardMidiIO.ts"/>
/// <reference path="../keyboard/songLoader.ts"/>

console.log("hello world");

// Initialization
let padIO = new DefaultPadIO();
KeyboardIO.instance.attachListener(padIO);
let midiIo = new MidiIO();
padIO.attachListener(midiIo);
Globals.midiConfig = new MidiConfiguration([]);
Globals.playerConfig = new PlayConfiguration([]);
Globals.BPM = 120;

let body = document.getElementsByTagName("body")[0];

let eqLoader = new SongLoader("eq");

let keyboard = new Keyboard();
body.appendChild(keyboard.getElt());
keyboard.keyboard.prepend(eqLoader.getElt());
let keyboardIO = new KeyboardMidiIO(keyboard);
padIO.attachListener(keyboardIO);

// PLAYER TEST
// let player = new Player();
// body.appendChild(player.getElt());
// let pEventHandler = new PlayerEventHandler(player);
// KeyboardIO.instance.attachListener(pEventHandler);

// AUDIO ANALYZER TEST
// let analyze = new AudioAnalyzer();
// body.appendChild(analyze.getElt());

// WAVEFORM ANAZYLER TEST
// let analyze = new WaveformAnalyzer();
// body.appendChild(analyze.getElt());
// Backend.getAsAudioBuffer("resources/eq/sounds/chain1/a0.mp3").then((data: ArrayBuffer) => {
//   Globals.fromArray(data).then((audioBuf) => {
//     console.log("setting");
//     analyze.setBuffer(audioBuf);
//   });
// });

// class AnalyzeIO extends AbstractIO<KeyboardMessage, void> {
//   public receiveMessage(msg: KeyboardMessage) {
//     if (msg.keyCode === 32) {
//       if (msg.direction === KeyDirection.DOWN) {
//         analyze.pressSpace();
//       }
//       // space presses recently selected button on chrome
//       msg.event.preventDefault();
//     }
//   }
// }
// KeyboardIO.instance.attachListener(new AnalyzeIO);

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