class Sample {

  public readonly buffer: AudioBuffer;
  public startTime: number;
  public endTime: number;
  public readonly loop: boolean;

  private node: AudioBufferSourceNode;

  private playing: boolean;

  private prevStartedTime: number;

  constructor(buffer: AudioBuffer, loop: boolean, startTime?: number, endTime?: number) {
    this.buffer = buffer;
    this.loop = loop;

    this.startTime = startTime || 0;
    this.endTime = endTime || this.buffer.duration;
  }

  public bufferDuration(): number {
    return this.buffer.duration;
  }

  public duration(): number {
    return this.endTime - this.startTime;
  }

  public getBufferPos(): number {
    return this.getPos() + this.startTime;
  }

  // if you want absolute buffer pos, add this.startTime
  public getPos(): number {
    if (this.isPlaying) {
      return Globals.audioCtx.currentTime - this.prevStartedTime;
    } else {
      // TODO maybe add an most recently ended timestamp to compute paused position
      return 0;
    }
  }

  /**
   * Start the sound
   * @param when the time in seconds to start the sound
   */
  public start(when = 0): Promise<Sample> {
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
    } else {
      this.node.start(when, this.startTime, this.endTime - this.startTime);
    }

    // set the start time so we can seek later
    if (when < Globals.audioCtx.currentTime) {
      this.prevStartedTime = Globals.audioCtx.currentTime;
    } else {
      this.prevStartedTime = when;
    }

    this.playing = true;
    this.node.onended = () => {
      this.playing = false;
    };

    return this.promiseThis((when - Globals.audioCtx.currentTime) * 1000);
  }

  /**
   * stop the sound
   * @param when when to stop the sound in seconds
   */
  public stop(when = 0): Promise<Sample> {
    if (this.node !== undefined) {
      this.node.stop(when);

      return this.promiseThis((when - Globals.audioCtx.currentTime) * 1000);
    } else {
      return this.promiseThis(0);
    }
  }

  public isPlaying(): boolean {
    return this.playing;
  }

  /**
   * promise this in timeout ms
   * @param timeout the timeout in ms
   */
  private promiseThis(timeout: number): Promise<Sample> {
    if (timeout <= 0) {
      return new Promise((resolve, reject) => {
        resolve(this);
      });
    }
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        resolve(this);
      }, timeout);
    });
  }
}