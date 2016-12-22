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
    this.asElement().append('<canvas id="waveform">Your Browser Does Not Support The Canvas Element</canvas>');
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

  /**
   * inspect the given sound file with the given name
   * @method inspect
   * @param {String} name the name of the file
   * @param {SoundFile} sound the sound file
   */
  public inspect(name: string, sound: SoundFile) {
    // set the name
    this.nameElement.html(name);

    // set the current sound
    this.currentSound = sound.sound;

    if (this.canvas === undefined) {
      this.canvas = document.getElementById('waveform');
      this.ctx = this.canvas.getContext('2d');
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
       this.refreshCanvas(buffer.getChannelData(0), buffer.getChannelData(1));
    });
  }

  // refresh the canvas with the two channels
  private refreshCanvas(ch1: Float32Array, ch2: Float32Array) {
    this.ctx.fillStyle = 'black';

    // TODO make constant x scale and allow scrolling
    // TODO allow scrubbing

    // compute the scales
    let xScale = this.canvas.width / ch1.length;
    let yScale = this.canvas.height / 4;

    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // draw first channel
    this.ctx.beginPath();
    this.ctx.moveTo(0, yScale);
    for (let i = 0; i < ch1.length; i++) {
      this.ctx.lineTo(i * xScale, (ch1[i] + 1) * yScale);
    }
    this.ctx.stroke();

    // draw second channel
    this.ctx.beginPath();
    this.ctx.moveTo(0, yScale * 3);
    for (let i = 0; i < ch1.length; i++) {
      this.ctx.lineTo(i * xScale, (ch2[i] + 3) * yScale);
    }
    this.ctx.stroke();
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
