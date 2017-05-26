/**
 * a class to draw a sound's waveform and provide 
 * a simple editor to adjust the sounds in and out points
 */
class DrawSound extends DomElement {
  private canvas: HTMLElement;
  private ctx: CanvasRenderingContext2D;

  // the button elements to set the input and output of the sound
  private setIn: JQW;
  private setOut: JQW;

  private inTime = 0;
  private outTime = 0;
  // pixels per sample
  private scale = 0.08;
  private offset = 0;
  private padding = 20;
  // samples per second
  private sampleRate: number;

  // the position of the cursor in seconds
  private cursorAt = 0;

  // the sound buffers
  private ch1: Float32Array;
  private ch2: Float32Array;

  // the next start position of the sound
  private nextPos = 0;

  private mousedown = false;

  // the numnerb mapping to the refresh interval
  private refreshInterval: number;

  // the sound being drawn
  private currentSound: Sound;

  // create a new waveform container with in and out buttons
  constructor() {
    super(new JQW('<div class="waveform"></div>'));

    let canvasElement = new JQW(`<canvas class="waveform-canvas" width="10" height="10">
                                   Your Browser Does Not Support The Canvas Element
                                 </canvas>`);

    this.asElement().append(canvasElement);
    this.canvas = canvasElement.getDomObj();

    // TODO investigate
    // this.asElement().css({
    //   'overflow-x': 'hidden',
    //   'overflow-y': 'hidden'
    // });

    // create the set points buttons and listeners
    let setPoints = new JQW('<div style="display: inline-block;"></div>');
    this.asElement().append(setPoints);

    // set up the setIn and setOut buttons
    this.setIn = new JQW('<button>Set in point</button>');
    this.setOut = new JQW('<button>Set out point</button>');
    setPoints.append(this.setIn);
    setPoints.append(this.setOut);

    // stop mouse down event propegating to parent element
    this.setIn.mousedown(() => {
      return false;
    });
    // stop mouse down event propegating to parent element
    this.setOut.mousedown(() => {
      return false;
    });

    this.setIn.click(() => {
      if (this.currentSound && this.cursorAt < this.outTime) {
        this.inTime = this.cursorAt;
        this.setSprite();
      }
    });
    this.setOut.click(() => {
      if (this.currentSound && this.cursorAt > this.inTime) {
        this.outTime = this.cursorAt;
        this.setSprite();
      }
    });

    // set scrubbing listeners
    this.asElement().mousedown((e: JQueryMouseEventObject) => {
      this.setNextPos(e.pageX);
      this.mousedown = true;
    });
    this.asElement().mousemove((e: JQueryMouseEventObject) => {
      if (this.mousedown)
       this.setNextPos(e.pageX);
    });
    this.asElement().mouseup((e: JQueryMouseEventObject) => {
      this.mousedown = false;
    });
    this.asElement().mouseleave((e: JQueryMouseEventObject) => {
      this.mousedown = false;
    });

    // set scale and scroll listeners
    this.canvas.addEventListener('wheel', (e: WheelEvent) => {
      if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) {
        this.offset -= e.deltaX;
      } else {
        let prevScale = this.scale;
        this.scale -= e.deltaY / (500 / this.scale);

        this.offset = e.offsetX - ((this.scale / prevScale) * (e.offsetX - this.offset));
      }

      // clamp scale and offset, offset depends on scale
      this.scale = Math.min(Math.max(this.scale, (this.canvas.width - this.padding * 2) / this.ch1.length), 0.33);
      this.offset = Math.min(Math.max(this.offset, - this.ch1.length * this.scale + this.canvas.width - this.padding), this.padding);

      e.preventDefault();
      return false;
    });

    this.offset = this.padding;
  }

  /**
   * set the sound to be inspected.
   * @param sound the sound to inspect
   * @param enableInOut optinally enable/disable the in out controls
   * @param buffer optionally provide the audio buffer to remove duplication of work
   */
  public setSound(sound: Sound, enableInOut?: boolean, buffer?: AudioBuffer) {
    if (enableInOut) {
      this.setIn.getJQ().prop('disabled', false);
      this.setOut.getJQ().prop('disabled', false);
    }
    else {
      this.setIn.getJQ().prop('disabled', true);
      this.setOut.getJQ().prop('disabled', true);
    }

    if (this.currentSound !== undefined)
      this.currentSound.stop();

    // initialize the canvas and context
    if (this.ctx === undefined) {
      this.canvas.width = Math.floor(this.asElement().width());
      this.canvas.height = this.asElement().height();
      this.ctx = this.canvas.getContext('2d');
    }

    this.currentSound = sound;

    if (buffer !== undefined) {
      this.setBufferedSoundElements(buffer);
    } else {
      let raw = this.currentSound.getSrc();
      raw = raw.substring(SoundUtils.mp3Meta64.length, raw.length);

      // convert the base64 data to a byte array
      let data = SoundUtils.base64ToArrayBuffer(raw);
      // decode the byte array and draw the stero waveform onto the canvas
      AudioTools.audioContext.decodeAudioData(data, (buffer: AudioBuffer) => {
        this.setBufferedSoundElements(buffer);
      });
    }
  }

  /**
   * clear the data in this object and hide this element
   */
  public clearData() {
    if (this.refreshInterval)
      clearInterval(this.refreshInterval);

    if (this.ctx !== undefined)
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    this.ch1 = undefined;
    this.ch2 = undefined;

    if (this.currentSound !== undefined)
      this.currentSound.stop();
    this.currentSound = undefined;
  }

  /**
   * set the in time of the sound to the given time
   * @param time the time in seconds to set in time to
   */
  public setInTime(time: number) {
    this.inTime = time;
    this.setSprite();
  }

  /**
   * set the out time of the sound to the given time
   * @param time the time in seconds to set out time to
   */
  public setOutTime(time: number) {
    this.outTime = time;
    this.setSprite();
  }

  /**
   * initialize variables from the current buffer
   * @param buffer the current buffer being inspected
   */
  private setBufferedSoundElements(buffer: AudioBuffer) {
    // setup the channels
    this.ch1 = buffer.getChannelData(0);
    this.ch2 = buffer.getChannelData(1);
    this.sampleRate = buffer.sampleRate;
    this.nextPos = 0;

    // try to get the endpoints from the sound array
    let arr = this.currentSound.toArr();
    if (arr.length > 1) {
      this.inTime = <number> arr[1] / 1000;
      this.outTime = <number> arr[2] / 1000;
    } else {
      this.inTime = 0;
      this.outTime = buffer.duration;
    }

    // initialize the scale
    this.scale = (this.canvas.width - this.padding * 2) / this.ch1.length;

    this.refreshInterval = setInterval(() => {
      this.refreshCanvas();
    }, 25);
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
        this.nextPos = this.currentSound.seek() - this.inTime;
      } else {
        this.currentSound.play();

        this.currentSound.seek(this.nextPos + this.inTime);

        this.nextPos = 0;
      }
    }
  }

  /**
   * set the sample sprite for the sound to the current in and out points
   */
  private setSprite() {
    this.currentSound.editSprite(this.inTime * 1000, this.outTime * 1000);
    this.nextPos = 0;
  }

  /**
   * set the next playback position based on the mouse position
   */
  private setNextPos(mouseX: number) {
    if (this.currentSound) {
      this.currentSound.pause();
      this.nextPos = (mouseX - this.offset - this.asElement().offset().left) / this.scale / this.sampleRate;

      if (this.nextPos < 0)
        this.nextPos = 0;
      if (this.nextPos > this.currentSound.duration())
        this.nextPos = this.currentSound.duration();

      this.nextPos -= this.inTime;
    }
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

    let constance = 5;

    let interval = Math.ceil((end - start) / (1000 * constance)) * constance;
    start = Math.floor(start / interval) * interval;

    if (this.ch1) {
      // draw first channel
      this.ctx.beginPath();
      this.ctx.moveTo(0, yScale);
      if (this.offset > 0)
        this.ctx.lineTo(this.offset, yScale);
      for (let i = start; i < end; i += interval) {
        this.ctx.lineTo(this.offset + i * this.scale, (this.ch1[i] + 1) * yScale);
      }
      if (this.offset + this.ch1.length * this.scale - this.canvas.width < 0)
        this.ctx.lineTo(this.offset + this.ch1.length * this.scale, yScale);
      this.ctx.lineTo(this.canvas.width, yScale);
      this.ctx.stroke();

      // draw second channel
      this.ctx.beginPath();
      this.ctx.moveTo(0, yScale * 3);
      if (this.offset > 0)
        this.ctx.lineTo(this.offset, yScale * 3);
      for (let i = start; i < end; i += interval) {
        this.ctx.lineTo(this.offset + i * this.scale, (this.ch2[i] + 3) * yScale);
      }
      if (this.offset + this.ch1.length * this.scale - this.canvas.width < 0)
        this.ctx.lineTo(this.offset + this.ch1.length * this.scale, yScale * 3);
      this.ctx.lineTo(this.canvas.width, yScale * 3);
      this.ctx.stroke();

      this.cursorAt = (this.currentSound.playing() ? this.currentSound.seek() : this.nextPos + this.inTime);

      this.drawCursorAtTime(this.cursorAt, 0);
      this.ctx.fillStyle =  'blue';
      this.drawCursorAtTime(this.inTime, 6);
      this.drawCursorAtTime(this.outTime, 6);
    }
  }

  /**
   * draw a cursor at the given time. Will scale x to pixels
   */
  private drawCursorAtTime(x: number, padding: number) {
    // seconds * samples per second * pixels per sample
    this.ctx.fillRect((x * this.sampleRate * this.scale) + this.offset - 1, padding, 2, this.canvas.height - padding * 2);
  }
}