// canvas element (drag, play pause, set in out)

class WaveformAnalyzer extends DomElt {
  private canvas: HTMLElement;
  private ctx: CanvasRenderingContext2D;

  // the button elements to set the input and output of the sound
  private setIn: HTMLElement;
  private setOut: HTMLElement;

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
  private currentSound: Sample;

  constructor() {
    super("div", {"class": "waveform"}, "");

    this.canvas = DomUtils.makeElt("canvas",
     {"class" : "waveform-canvas", "width" : "10", "height" : "10"},
     "Your Browser Does Not Support The Canvas Element");

    this.elt.appendChild(this.canvas);

    // create the set points buttons and listeners
    let setPoints = DomUtils.makeElt("div", {"style" : "display: inline-block;"}, "");
    this.elt.appendChild(setPoints);

    // set up the setIn and setOut buttons
    this.setIn = DomUtils.makeElt("button", {}, "Set in point");
    this.setOut = DomUtils.makeElt("button", {}, "Set out point");
    setPoints.appendChild(this.setIn);
    setPoints.appendChild(this.setOut);

    // stop mouse down event propegating to parent element
    this.setIn.onmousedown = (e: MouseEvent) => {
      e.stopPropagation();
    };
    // stop mouse down event propegating to parent element
    this.setOut.onmousedown = (e: MouseEvent) => {
      e.stopPropagation();
    };

    this.setIn.onclick = () => {
      if (this.currentSound && this.cursorAt < this.outTime) {
        this.inTime = this.cursorAt;
        if (this.currentSound) this.currentSound.startTime = this.inTime;
        this.nextPos = 0;
      }
    };
    this.setOut.onclick = () => {
      if (this.currentSound && this.cursorAt > this.inTime) {
        this.outTime = this.cursorAt;
        if (this.currentSound) this.currentSound.endTime = this.outTime;
      }
    };

    // set scrubbing listeners
    this.elt.onmousedown = (e: MouseEvent) => {
      this.setNextPos(e.pageX);
      this.mousedown = true;
    };
    this.elt.onmousemove = (e: MouseEvent) => {
      if (this.mousedown)
       this.setNextPos(e.pageX);
    };
    this.elt.onmouseup = (e: MouseEvent) => {
      this.mousedown = false;
    };
    this.elt.onmouseleave = (e: MouseEvent) => {
      this.mousedown = false;
    };

    // set scale and scroll listeners
    this.canvas.addEventListener("wheel", (e: WheelEvent) => {
      if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) {
        this.offset -= e.deltaX;
      } else {
        let prevScale = this.scale;
        this.scale -= e.deltaY / (500 / this.scale);

        this.offset = e.offsetX - ((this.scale / prevScale) * (e.offsetX - this.offset));
      }

      // clamp scale and offset, offset depends on scale
      this.scale = Math.min(Math.max(this.scale, (this.canvas.offsetWidth - this.padding * 2) / this.ch1.length), 0.33);
      this.offset = Math.min(Math.max(this.offset, - this.ch1.length * this.scale + this.canvas.offsetWidth - this.padding), this.padding);

      e.preventDefault();
      return false;
    });

    this.offset = this.padding;
  }

  /**
   * clear the data in this object and hide this element
   */
  public clearData() {
    if (this.refreshInterval)
      clearInterval(this.refreshInterval);

    if (this.ctx !== undefined)
      this.ctx.clearRect(0, 0, this.canvas.offsetWidth, this.canvas.offsetHeight);

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
    this.currentSound.startTime = time;
  }

  /**
   * set the out time of the sound to the given time
   * @param time the time in seconds to set out time to
   */
  public setOutTime(time: number) {
    this.outTime = time;
    this.currentSound.endTime = time;
  }

  public getInTime() {
    return this.inTime;
  }

  public getOutTime() {
    return this.outTime;
  }

  public setBuffer(buffer: AudioBuffer) {
    // initialize the canvas and context
    if (this.ctx === undefined) {
      this.canvas.setAttribute("width", Math.floor(this.elt.offsetWidth) + "px");
      this.canvas.setAttribute("height", this.elt.offsetHeight + "px");
      this.ctx = (this.canvas as HTMLCanvasElement).getContext("2d");
    }

    this.currentSound = new Sample(buffer, false);

    // setup the channels
    this.ch1 = buffer.getChannelData(0);
    this.ch2 = buffer.getChannelData(1);
    this.sampleRate = buffer.sampleRate;
    this.nextPos = 0;

    this.inTime = 0;
    this.outTime = buffer.duration;

    // initialize the scale
    this.scale = (this.canvas.offsetWidth - this.padding * 2) / this.ch1.length;

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
      if (this.currentSound.isPlaying()) {
        this.currentSound.stop();
        this.nextPos = this.currentSound.getBufferPos() - this.inTime;
      } else {
        if (this.nextPos + this.inTime < this.currentSound.endTime) {
          this.currentSound.startTime = this.nextPos + this.inTime;
        } else {
          this.currentSound.startTime = this.inTime;
        }
        this.currentSound.start(0);

        this.nextPos = 0;
      }
    }
  }

  /**
   * set the sample sprite for the sound to the current in and out points
   */

  /**
   * set the next playback position based on the mouse position
   */
  private setNextPos(mouseX: number) {
    if (this.currentSound) {
      this.currentSound.stop(0);
      this.nextPos = (mouseX - this.offset - this.elt.offsetLeft) / this.scale / this.sampleRate;

      if (this.nextPos < 0)
        this.nextPos = 0;
      if (this.nextPos > this.currentSound.bufferDuration())
        this.nextPos = this.currentSound.bufferDuration();

      this.nextPos -= this.inTime;
    }
  }

  /**
   * refresh the canvas with the two channels
   */
  private refreshCanvas() {
    this.ctx.fillStyle = "black";

    // compute the scales
    let yScale = this.canvas.offsetHeight / 4;

    this.ctx.clearRect(0, 0, this.canvas.offsetWidth, this.canvas.offsetHeight);

    let start = Math.floor(-this.offset / (this.scale));
    let end = Math.ceil((this.canvas.offsetWidth - this.offset) / this.scale);

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
      if (this.offset + this.ch1.length * this.scale - this.canvas.offsetWidth < 0)
        this.ctx.lineTo(this.offset + this.ch1.length * this.scale, yScale);
      this.ctx.lineTo(this.canvas.offsetWidth, yScale);
      this.ctx.stroke();

      // draw second channel
      this.ctx.beginPath();
      this.ctx.moveTo(0, yScale * 3);
      if (this.offset > 0)
        this.ctx.lineTo(this.offset, yScale * 3);
      for (let i = start; i < end; i += interval) {
        this.ctx.lineTo(this.offset + i * this.scale, (this.ch2[i] + 3) * yScale);
      }
      if (this.offset + this.ch1.length * this.scale - this.canvas.offsetWidth < 0)
        this.ctx.lineTo(this.offset + this.ch1.length * this.scale, yScale * 3);
      this.ctx.lineTo(this.canvas.offsetWidth, yScale * 3);
      this.ctx.stroke();

      this.cursorAt = (this.currentSound.isPlaying() ? this.currentSound.getBufferPos() : (this.nextPos + this.inTime));

      this.drawCursorAtTime(this.cursorAt, 0);
      this.ctx.fillStyle =  "blue";
      this.drawCursorAtTime(this.inTime, 6);
      this.drawCursorAtTime(this.outTime, 6);
    }
  }

  /**
   * draw a cursor at the given time. Will scale x to pixels
   */
  private drawCursorAtTime(x: number, padding: number) {
    // seconds * samples per second * pixels per sample
    this.ctx.fillRect((x * this.sampleRate * this.scale) + this.offset - 1, padding, 2, this.canvas.offsetHeight - padding * 2);
  }
}