class SoundTools extends DomElement {

  // the audio context for the file inspector
  private audioCtx = new (window.AudioContext || window.webkitAudioContext)();

  private nameElement: JQW;
  private waveformContainer: JQW;
  private setPoints: JQW;
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

  private ch1: Float32Array;
  private ch2: Float32Array;
  private nextPos = 0;

  private refreshInterval: number;

  private mousedown = false;

  // the current sound being inspected
  private currentSound: Sound;

  constructor() {
    super(new JQW('<div id="sound-tools" class="horizontal-column"></div>'));

    // create the name and waveform elements
    this.nameElement = new JQW('<div id="file-name">File Name</div>');
    this.asElement().append(this.nameElement);
    this.waveformContainer = new JQW('<div id="waveform"></div>');
    this.asElement().append(this.waveformContainer);
    this.waveformContainer.append(`<canvas id="waveform-canvas" width="200" height="100">
                                    Your Browser Does Not Support The Canvas Element
                                   </canvas>`
                                 );

    // create the set points buttons and listeners
    this.setPoints = new JQW('<div></div>');
    this.asElement().append(this.setPoints);

    let setIn = new JQW('<button>Set in point</button>');
    let setOut = new JQW('<button>Set out point</button>');
    this.setPoints.append(setIn);
    this.setPoints.append(setOut);
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

    // set scrubbing listeners
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
    this.waveformContainer.mouseleave((e: JQueryMouseEventObject) => {
      this.mousedown = false;
    });

    // initially hide the elements
    this.nameElement.hide();
    this.waveformContainer.hide();
    this.setPoints.hide();
  }

  public inspectSound(sound: Sound, inOutControls: boolean) {
    this.currentSound = sound;

    this.nameElement.html(this.currentSound.getLoc());

    this.showSoundContext(inOutControls);

    this.displayAudioData();
  }

  /**
   * show the sound context
   * @param setPoints if true, show the set in and out points for the
   */
  private showSoundContext(setPoints: boolean) {
    if (this.canvas === undefined) {
      this.canvas = document.getElementById('waveform-canvas');
      this.ctx = this.canvas.getContext('2d');
      this.canvas.width = this.waveformContainer.width();
      this.canvas.height = this.waveformContainer.height();

      // set scale and scroll listeners
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
    }

    this.nameElement.show();
    this.waveformContainer.show();
    if (setPoints)
      this.setPoints.show();
    else
      this.setPoints.hide();
  }

  /**
   * called when the space bar is pressed
   * and the inspector is in the current mode
   */
  public pressSpace() {
    // make sure that there is a sound
    if (this.currentSound) {
      // if the sound is playing
      if (this.currentSound.playing()) {
        this.currentSound.pause();
        this.nextPos = this.currentSound.seek();
      } else {
        // this.currentSound.play('sample');
        this.currentSound.play();

        this.currentSound.seek(this.nextPos);

        this.nextPos = 0;
      }
    }
  }

  /**
   * clear the inspector
   */
  public clear() {
    this.currentSound = undefined;
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }

  /**
   * display the current audio data from the current sound
   */
  private displayAudioData() {
    // cut out the base64 metadata
    let begin = 'data:audio/mp3;base64,';
    let raw = this.currentSound.getSrc();
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

      // this.setSprite();

      if (this.refreshInterval) {
        clearInterval(this.refreshInterval);
      }

      this.refreshInterval = setInterval(() => {
        this.refreshCanvas();
      }, 25);
    });
  }

  /**
   * convert a base64 array to a byte array
   */
  private base64ToArrayBuffer(base64: string): ArrayBuffer {
    let binaryString = window.atob(base64);
    let len = binaryString.length;
    let bytes = new Uint8Array( len );
    for (let i = 0; i < len; i++)        {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes.buffer;
  }

  /**
   * set the sample sprite for the sound to the current in and out points
   */
  private setSprite() {
    this.currentSound.editSprite(this.inTime * 1000, this.outTime * 1000);
    this.nextPos = 0;
  }

  /**
   * refresh the canvas with the two channels
   */
  private refreshCanvas() {
    this.ctx.fillStyle = 'black';

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

      console.log();

      // seconds * samples per second * pixels per sample
      this.cursorAt = (this.currentSound.playing() ? this.currentSound.seek() : this.nextPos) + this.inTime;

      this.drawCursorAtTime(this.cursorAt);
      this.ctx.fillStyle =  'blue';
      this.drawCursorAtTime(this.inTime);
      this.drawCursorAtTime(this.outTime);
    }
  }

  /**
   * set the next playback position based on the mouse position
   */
  private setNextPos(mouseX: number) {
    if (this.currentSound)
      this.currentSound.pause();
    this.nextPos = (mouseX + this.offset - this.waveformContainer.offset().left) / this.scale / this.sampleRate - this.inTime;
  }

  /**
   * draw a cursor at the given time. Will scale x to pixels
   */
  private drawCursorAtTime(x: number) {
    this.ctx.fillRect((x * this.sampleRate * this.scale) + this.offset - 1, 0, 2, this.canvas.height);
  }
}
