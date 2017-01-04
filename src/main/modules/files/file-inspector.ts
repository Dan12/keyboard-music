/**
 * A gui class for inspecting a sound file
 * @class FileInspector
 * @static
 */
class FileInspector extends JQElement {

  private static instance: FileInspector;

  // the audio context for the file inspector
  private audioCtx = new (window.AudioContext || window.webkitAudioContext)();

  // the current sound being inspected
  private currentSound: Howl;

  private nameElement: JQuery;
  private canvas: HTMLElement;
  private ctx: CanvasRenderingContext2D;

  private inTime = 0;
  private outTime = 0;
  // pixels per sample
  private scale = 0.08;
  private offset = 0;
  private padding = 30;
  // samples per second
  private sampleRate: number;

  private cursorAt = 0;

  private waveformContainer: JQuery;

  private ch1: Float32Array;
  private ch2: Float32Array;
  private nextPos = 0;

  private refreshInterval: number;

  private mousedown = false;

  /**
   * return the singleton instance of this class
   * @method getInstance
   * @static
   * @return {FileInspector} the instance
   */
  public static getInstance(): FileInspector {
    if (FileInspector.instance === undefined) {
      FileInspector.instance = new FileInspector();
    }

    return FileInspector.instance;
  }

  private constructor() {
    super($('<div id="file-inspector"></div>'));

    this.nameElement = $('<div id="f-name">File Name</div>');
    this.asElement().append(this.nameElement);
    this.waveformContainer = $('<div id="waveform"></div>');
    this.asElement().append(this.waveformContainer);
    this.waveformContainer.append(`<canvas id="waveform-canvas" width="200" height="100">
                                    Your Browser Does Not Support The Canvas Element
                                   </canvas>`
                                 );

    let setIn = $('<button disabled="disabled">Set in point</button>');
    let setOut = $('<button disabled="disabled">Set out point</button>');
    this.asElement().append(setIn);
    this.asElement().append(setOut);
    setIn.click(() => {
      if (this.currentSound && this.cursorAt < this.outTime) {
        this.inTime = this.cursorAt;
        this.setSprite();
      }
    });

    setOut.click(() => {
      if (this.currentSound && this.cursorAt > this.inTime) {
        this.outTime = this.cursorAt;
        this.setSprite();
      }
    });
  }

  private initContext() {
    this.canvas = document.getElementById('waveform-canvas');
    this.ctx = this.canvas.getContext('2d');
    this.canvas.width = this.waveformContainer.width();
    this.canvas.height = this.waveformContainer.height();

    this.canvas.addEventListener('wheel', (e: WheelEvent) => {
      if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) {
        this.offset -= e.deltaX;
      } else {
        this.scale -= e.deltaY / (500 / this.scale);
      }

      // clamp scale and offset, offset depends on scale
      this.scale = Math.min(Math.max(this.scale, this.canvas.width / this.ch1.length), 0.33);
      this.offset = Math.min(Math.max(this.offset, - this.ch1.length * this.scale + this.canvas.width), 0);

      e.preventDefault();
      return false;
    });

    this.waveformContainer.mousedown((e: JQueryMouseEventObject) => {
      this.setNextPos(e.pageX);
      this.mousedown = true;
    });

    this.waveformContainer.mousemove((e: JQueryMouseEventObject) => {
      if (this.mousedown)
       this.setNextPos(e.pageX);
    });

    this.waveformContainer.mouseup((e: JQueryMouseEventObject) => {
      this.mousedown = false;
    });
  }

  private setNextPos(mouseX: number) {
    if (this.currentSound)
      this.currentSound.pause();
    this.nextPos = (mouseX + this.offset - this.waveformContainer.offset().left) / this.scale / this.sampleRate - this.inTime;
  }

  /**
   * called when the space bar is pressed
   * and the inspector is in the current mode
   * @method pressSpace
   */
  public pressSpace() {
    // make sure that there is a sound
    if (this.currentSound) {
      // if the sound is paused
      if (this.currentSound.pos() === 0) {
        this.currentSound.play('sample');

        // set the playback if set
        if (this.nextPos > 0 && this.nextPos < this.outTime - this.inTime) {
            this.currentSound.pos(this.nextPos);
        } else {
          this.nextPos = 0;
        }
      } else {
        this.currentSound.pause();
        this.nextPos = this.currentSound.pos();
      }

    }
  }

  private setSprite() {
    this.currentSound.sprite({sample: [this.inTime * 1000, (this.outTime - this.inTime) * 1000]});
    this.nextPos = 0;
  }

  /**
   * clear the inspector
   * @method clear
   */
  public clear() {
    this.currentSound = undefined;
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }

  public inspectSound(sound: Sound) {
    // TODO
    throw 'Unsuported operation';
  }

  /**
   * inspect the given sound file with the given name
   * @method inspect
   * @param {String} name the name of the file
   * @param {SoundFile} sound the sound file
   */
  public inspectFile(name: string, sound: SoundFile) {
    // set the name
    this.nameElement.html(name);

    // set the current sound
    this.currentSound = sound.sound;

    if (this.canvas === undefined) {
      this.initContext();
    }

    // create a new blank audio source
    let source = this.audioCtx.createBufferSource();

    // cut out the base64 metadata
    let begin = 'data:audio/mp3;base64,';
    let raw = sound.sound._src;
    raw = raw.substring(begin.length, raw.length);

    // convert the base64 data to a byte array
    let data = this.base64ToArrayBuffer(raw);

    // decode the byte array and draw the stero waveform onto the canvas
    this.audioCtx.decodeAudioData(data, (buffer: AudioBuffer) => {
      this.ch1 = buffer.getChannelData(0);
      this.ch2 = buffer.getChannelData(1);
      this.sampleRate = buffer.sampleRate;
      this.nextPos = 0;
      this.inTime = 0;
      this.outTime = buffer.duration;
      this.scale = this.canvas.width / this.ch1.length;

      this.setSprite();

      if (this.refreshInterval) {
        clearInterval(this.refreshInterval);
      }

      this.refreshInterval = setInterval(() => {
        this.refreshCanvas();
      }, 50);
    });
  }

  // refresh the canvas with the two channels
  private refreshCanvas() {
    this.ctx.fillStyle = 'black';

    // TODO allow scrubbing

    // compute the scales
    let yScale = this.canvas.height / 4;

    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    let start = Math.floor(-this.offset / (this.scale));
    let end = Math.ceil((this.canvas.width - this.offset) / this.scale);

    let constance = 3;

    let interval = Math.ceil((end - start) / (1000 * constance)) * constance;
    start = Math.floor(start / constance) * constance;

    if (this.ch1) {
      // draw first channel
      this.ctx.beginPath();
      this.ctx.moveTo(0, yScale);
      for (let i = start; i < end; i += interval) {
        this.ctx.lineTo(this.offset + i * this.scale, (this.ch1[i] + 1) * yScale);
      }
      this.ctx.stroke();

      // draw second channel
      this.ctx.beginPath();
      this.ctx.moveTo(0, yScale * 3);
      for (let i = start; i < end; i += interval) {
        this.ctx.lineTo(this.offset + i * this.scale, (this.ch2[i] + 3) * yScale);
      }
      this.ctx.stroke();

      // seconds * samples per second * pixels per sample
      this.cursorAt = this.currentSound.pos();
      if (this.cursorAt === 0) {
        this.cursorAt = this.nextPos;
      }
      this.cursorAt += this.inTime;

      this.drawCursorAtTime(this.cursorAt);
      this.ctx.fillStyle =  'blue';
      this.drawCursorAtTime(this.inTime);
      this.drawCursorAtTime(this.outTime);
    }
  }

  private drawCursorAtTime(x: number) {
    this.ctx.fillRect((x * this.sampleRate * this.scale) + this.offset - 1, 0, 2, this.canvas.height);
  }

  // convert a base64 array to a byte array
  private base64ToArrayBuffer(base64: string): ArrayBuffer {
    let binaryString = window.atob(base64);
    let len = binaryString.length;
    let bytes = new Uint8Array( len );
    for (let i = 0; i < len; i++)        {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes.buffer;
  }
}
