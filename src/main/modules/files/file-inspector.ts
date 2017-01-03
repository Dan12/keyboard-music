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

  private inTime: number;
  private outTime: number;
  private scale = 0.08;
  private offset = 0;
  private padding = 30;

  private cursorAt = 0;

  private waveformContainer: JQuery;

  private ch1: Float32Array;
  private ch2: Float32Array;

  private refreshInterval: number;

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
  }

  private initContext() {
    this.canvas = document.getElementById('waveform-canvas');
    this.ctx = this.canvas.getContext('2d');
    this.canvas.width = this.waveformContainer.width();
    this.canvas.height = this.waveformContainer.height();

    this.canvas.addEventListener('wheel', (e: WheelEvent) => {
      if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) {
        this.offset -= e.deltaX;
        // this.offset = Math.min(Math.max(this.offset, ));
      } else {
        this.scale += e.deltaY / (500 / this.scale);
        this.scale = Math.min(Math.max(this.scale, 0.002), 0.33);
      }
      e.preventDefault();
      return false;
    });
  }

  /**
   * called when the space bar is pressed
   * and the inspector is in the current mode
   * @method pressSpace
   */
  public pressSpace() {
    // make sure that there is a sound
    if (this.currentSound) {
      // TODO allow pause and playback
      this.currentSound.play();
    }
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

      let temp = setInterval(() => {
        this.refreshCanvas();
      }, 50);

      this.refreshInterval = temp;
    });
  }

  // refresh the canvas with the two channels
  private refreshCanvas() {
    this.ctx.fillStyle = 'black';

    // TODO make constant x scale and allow scrolling
    // TODO allow scrubbing

    // compute the scales
    let yScale = this.canvas.height / 4;

    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    let interval = Math.floor(1 / (3 * this.scale));
    let start = Math.floor(this.offset / (this.scale * interval)) * interval;
    let end = Math.ceil((this.offset + this.canvas.width) / this.scale);

    console.log(this.offset);
    console.log(this.scale);
    console.log(start);
    console.log(end);

    if (this.ch1) {
      // draw first channel
      this.ctx.beginPath();
      this.ctx.moveTo(this.offset, yScale);
      for (let i = start; i < end; i += interval) {
        this.ctx.lineTo(this.offset + i * this.scale, (this.ch1[i] + 1) * yScale);
      }
      this.ctx.stroke();

      // draw second channel
      this.ctx.beginPath();
      this.ctx.moveTo(this.offset, yScale * 3);
      for (let i = start; i < end; i += interval) {
        this.ctx.lineTo(this.offset + i * this.scale, (this.ch2[i] + 3) * yScale);
      }
      this.ctx.stroke();
    }
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
