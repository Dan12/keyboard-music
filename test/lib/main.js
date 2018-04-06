class Globals {
    static fromArray(arr) {
        // decodeAudio returns promiseLike or something like that
        return Globals.audioCtx.decodeAudioData(arr);
    }
    static recInitArr(size, i, d) {
        let result = new Array(size[i]);
        if (i < size.length - 1) {
            i += 1;
            for (let j = 0; j < size[i]; j++) {
                result[j] = this.recInitArr(size, i, d);
            }
        }
        else {
            for (let j = 0; j < result.length; j++) {
                result[j] = d;
            }
        }
        return result;
    }
    static defaultArr(size, d) {
        return this.recInitArr(size, 0, d);
    }
}
Globals.audioCtx = new AudioContext();
class Sample {
    constructor(buffer, loop) {
        this.buffer = buffer;
        this.loop = loop;
        this.startTime = 0;
        this.endTime = this.buffer.duration;
    }
    /**
     * Start the sound
     * @param when the time in seconds to start the sound
     */
    start(when = 0) {
        // need to create new sound every time
        this.node = Globals.audioCtx.createBufferSource();
        // TODO maybe put init into own method?
        this.node.buffer = this.buffer;
        this.node.loop = this.loop;
        if (this.loop) {
            this.node.loopStart = this.startTime;
            this.node.loopEnd = this.endTime;
        }
        this.node.connect(Globals.audioCtx.destination);
        if (this.loop) {
            this.node.start(when, this.startTime);
        }
        else {
            this.node.start(when, this.startTime, this.endTime - this.startTime);
        }
        this.playing = true;
        this.node.onended = () => {
            this.playing = false;
        };
        return this.promiseThis(when * 1000);
    }
    /**
     * stop the sound
     * @param when when to stop the sound in seconds
     */
    stop(when = 0) {
        if (this.node !== undefined) {
            this.node.stop(when);
            return this.promiseThis(when * 1000);
        }
        else {
            return this.promiseThis(0);
        }
    }
    isPlaying() {
        return this.playing;
    }
    /**
     * promise this in timeout ms
     * @param timout the timeout in ms
     */
    promiseThis(timout) {
        if (timout === 0) {
            return new Promise((resolve, reject) => {
                resolve(this);
            });
        }
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                resolve(this);
            }, timout);
        });
    }
}
/// <reference path="../libraries/jszip.d.ts" />
class Backend {
    static getAsAudioBuffer(filename) {
        return new Promise((resolve, reject) => {
            let req = new XMLHttpRequest();
            req.open("GET", filename, true);
            req.responseType = "arraybuffer";
            req.onload = (event) => {
                resolve(req.response);
            };
            req.onerror = (event) => {
                reject(event);
            };
            req.send();
        });
    }
    static getJSON(filename) {
        return new Promise((resolve, reject) => {
            let req = new XMLHttpRequest();
            req.open("GET", filename, true);
            req.responseType = "json";
            req.onload = (event) => {
                resolve(req.response);
            };
            req.onerror = (event) => {
                reject(event);
            };
            req.send();
        });
    }
}
class AbstractIO {
    constructor() {
        this.listeners = [];
    }
    receiveMessage(msg) {
        // Do nothing
    }
    attachListener(l) {
        this.listeners.push(l);
    }
    sendMessage(msg) {
        this.listeners.forEach((i) => {
            i.receiveMessage(msg);
        });
    }
}
var KeyDirection;
(function (KeyDirection) {
    KeyDirection[KeyDirection["UP"] = 0] = "UP";
    KeyDirection[KeyDirection["DOWN"] = 1] = "DOWN";
})(KeyDirection || (KeyDirection = {}));
/// <reference path="./keyDirectionEnum.ts"/>
/**
 * Encapsulate a keycode
 */
class KeyboardMessage {
    constructor(kc, dir) {
        this.keyCode = kc;
        this.direction = dir;
    }
}
/// <reference path="./keyboardMessage.ts"/>
class KeyboardIO extends AbstractIO {
    constructor() {
        super();
        document.onkeydown = (event) => {
            this.sendMessage(new KeyboardMessage(event.keyCode, KeyDirection.DOWN));
        };
        document.onkeyup = (event) => {
            this.sendMessage(new KeyboardMessage(event.keyCode, KeyDirection.UP));
        };
    }
}
KeyboardIO.instance = new KeyboardIO();
var SoundpackKey;
(function (SoundpackKey) {
    SoundpackKey[SoundpackKey["LEFT"] = 0] = "LEFT";
    SoundpackKey[SoundpackKey["RIGHT"] = 1] = "RIGHT";
    SoundpackKey[SoundpackKey["TOP"] = 2] = "TOP";
    SoundpackKey[SoundpackKey["BOTTOM"] = 3] = "BOTTOM";
})(SoundpackKey || (SoundpackKey = {}));
/// <reference path="./soundPackEnum.ts"/>
class PadMessage {
    constructor(dirn, pack, row, col) {
        this.dirn = dirn;
        this.row = row;
        this.col = col;
        this.pack = pack;
    }
}
/// <reference path="./padMessage.ts"/>
class DefaultPadIO extends AbstractIO {
    constructor() {
        super();
        this.curPad = 0;
        this.isDown = Globals.defaultArr([DefaultPadIO.padKeys.length, DefaultPadIO.padKeys[0].length], false);
    }
    searchKeys(keyCode) {
        for (let r = 0; r < DefaultPadIO.padKeys.length; r++) {
            for (let c = 0; c < DefaultPadIO.padKeys[r].length; c++) {
                if (DefaultPadIO.padKeys[r][c] === keyCode) {
                    return [r, c];
                }
            }
        }
        return DefaultPadIO.invalidTuple;
    }
    receiveMessage(msg) {
        let soundpackKey = DefaultPadIO.soundpackKeys.indexOf(msg.keyCode);
        if (soundpackKey === -1) {
            let keyRC = this.searchKeys(msg.keyCode);
            if (keyRC !== DefaultPadIO.invalidTuple) {
                if (msg.direction === KeyDirection.DOWN) {
                    if (this.isDown[keyRC[0]][keyRC[1]]) {
                        return;
                    }
                    this.isDown[keyRC[0]][keyRC[1]] = true;
                }
                else if (msg.direction === KeyDirection.UP) {
                    this.isDown[keyRC[0]][keyRC[1]] = false;
                }
                this.sendMessage(new PadMessage(msg.direction, this.curPad, keyRC[0], keyRC[1]));
            }
        }
        else {
            this.curPad = soundpackKey;
        }
    }
}
DefaultPadIO.padKeys = [
    [49, 50, 51, 52, 53, 54, 55, 56, 57, 48, 189, 187],
    [81, 87, 69, 82, 84, 89, 85, 73, 79, 80, 219, 221],
    [65, 83, 68, 70, 71, 72, 74, 75, 76, 186, 222, 13],
    [90, 88, 67, 86, 66, 78, 77, 188, 190, 191, 16, -1]
];
DefaultPadIO.soundpackKeys = [37, 38, 40, 39];
DefaultPadIO.invalidTuple = [-1, -1];
class MidiConfiguration {
    constructor(sounds) {
        this.sounds = sounds;
    }
    start(p, r, c, w) {
        if (this.verifyPRC(p, r, c)) {
            return this.sounds[p][r][c].start(w);
        }
    }
    stop(p, r, c, w) {
        if (this.verifyPRC(p, r, c)) {
            return this.sounds[p][r][c].stop(w);
        }
    }
    playing(p, r, c) {
        if (this.verifyPRC(p, r, c)) {
            return this.sounds[p][r][c].playing();
        }
        return false;
    }
    verifyPRC(p, r, c) {
        return p >= 0 && r >= 0 && c >= 0 &&
            p < this.sounds.length && r < this.sounds[p].length && c < this.sounds[p][r].length &&
            this.sounds[p][r][c] !== undefined;
    }
}
/// <reference path="./sample.ts"/>
class Sound {
    constructor(pitch) {
        this.pitches = [pitch];
        this.loop = pitch.loop;
    }
    start(when) {
        return this.promiseThis(this.pitches[0].start(when));
    }
    stop(when) {
        return this.promiseThis(this.pitches[0].stop(when));
    }
    playing() {
        return this.pitches[0].isPlaying();
    }
    promiseThis(p) {
        return new Promise((resolve, reject) => {
            p.then(() => {
                resolve(this);
            });
        });
    }
}
/// <reference path="./sound.ts"/>
class PlayConfiguration {
    constructor(c) {
        this.config = c;
    }
    getPadConfig(p, r, c) {
        if (this.verifyPRC(p, r, c)) {
            return this.config[p][r][c];
        }
        else {
            return PadConfiguration.NoConfig;
        }
    }
    verifyPRC(p, r, c) {
        return p >= 0 && r >= 0 && c >= 0 &&
            p < this.config.length && r < this.config[p].length && c < this.config[p][r].length &&
            this.config[p][r][c] !== undefined;
    }
}
class PadConfiguration {
    constructor(htp, tggle, quant, grps) {
        this.holdToPlay = htp;
        this.toggle = tggle;
        this.quantization = quant;
        this.groups = grps;
    }
}
PadConfiguration.NoConfig = new PadConfiguration(false, false, 0, []);
/// <reference path="../midi/midiConfig.ts"/>
/// <reference path="../midi/playConfig.ts"/>
class MidiIO extends AbstractIO {
    constructor() {
        super(...arguments);
        this.soundpack = 0;
    }
    receiveMessage(msg) {
        let c = Globals.playerConfig.getPadConfig(msg.pack, msg.row, msg.col);
        if (c !== PadConfiguration.NoConfig) {
            let timeOffset = 0;
            if (c.quantization !== 0) {
                // smallest increment of 1/32 needs 10000 (64 would need 10 times)
                let scalar = 10000;
                // beats per second
                let bps = Globals.BPM / 60;
                let quantTime = c.quantization / bps;
                let currTime = Globals.audioCtx.currentTime;
                let alreadyElapsed = (currTime * scalar) % (quantTime * scalar);
                timeOffset = currTime + quantTime - (alreadyElapsed / scalar);
            }
            if (msg.dirn === KeyDirection.DOWN) {
                let playing = Globals.midiConfig.playing(msg.pack, msg.row, msg.col);
                // Stop all sounds in group (including this one)
                for (let sound of c.groups) {
                    sound.stop(timeOffset);
                }
                Globals.midiConfig.stop(msg.pack, msg.row, msg.col, timeOffset);
                // if toggle and was playing, leave in stopped state
                if (!(c.toggle && playing)) {
                    Globals.midiConfig.start(msg.pack, msg.row, msg.col, timeOffset);
                }
            }
            else if (msg.dirn === KeyDirection.UP) {
                if (!c.toggle && c.holdToPlay) {
                    Globals.midiConfig.stop(msg.pack, msg.row, msg.col, timeOffset);
                }
            }
        }
    }
}
/// <reference path="./globals.ts"/>
/// <reference path="../midi/sample.ts"/>
/// <reference path="./backend.ts"/>
/// <reference path="../IO/abstractIO.ts"/>
/// <reference path="../IO/keyboardIO.ts"/>
/// <reference path="../IO/defaultPadIO.ts"/>
/// <reference path="../IO/midiIO.ts"/>
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
function loadSound(p, r, c, sound, sounds, playConfig, groups) {
    if (sound.pitches !== undefined && sound.pitches.length > 0) {
        Backend.getAsAudioBuffer("resources/eq/sounds/" + sound.pitches[0]).then((buf) => {
            Globals.fromArray(buf).then((audioBuf) => {
                let samp = new Sample(audioBuf, sound.loop);
                let s = new Sound(samp);
                let sGroups = [];
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
        });
    }
    else {
        loaded();
    }
}
Backend.getJSON("resources/eq/song.json").then((song) => {
    Globals.BPM = song.bpm;
    let sounds = Globals.defaultArr([song.soundpacks.length, song.soundpacks[0].length, song.soundpacks[0][0].length], undefined);
    let playConfig = Globals.defaultArr([song.soundpacks.length, song.soundpacks[0].length, song.soundpacks[0][0].length], undefined);
    for (let p = 0; p < song.soundpacks.length; p++) {
        // groups by pack
        let groups = {};
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
//# sourceMappingURL=main.js.map