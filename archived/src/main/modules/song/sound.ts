/**
 * A class to abstract a howl object
 */
class Sound extends SinglePayload {

  private static nextID = 1;
  private id: number;

  private static assignID(): number {
    return Sound.nextID++;
  }

  /**
   * The howler js object which this class exposes a simple api for
   */
  private howl_object: Howl;

  private name: string;
  private location: string;

  private playID: number;

  /**
   * If created from is a Sound, this will copy the information from the old Sound.
   * If a start_time, end_time, and loop are specified in the options, those will be used.
   * Note that start_time and end_time should be in milliseconds
   *
   * If created is a string, this will load a new howl object from that string,
   * set the name and location from options.name and options.location respectively
   * and call the options callback function
   *
   * @param createFrom the string or sound to create this sound from
   * @param options the options object
   */
  public constructor(createFrom: (Sound|string), options: SoundOptions) {
    super(new JQW('<div class="file">' + (options.name !== undefined ? options.name : (<Sound> createFrom).name) + '</div>'));

    this.id = Sound.assignID();

    if (createFrom instanceof Sound) {
      // copy parameters from other
      let copyFrom = <Sound> createFrom;

      this.howl_object = copyFrom.howl_object;
      this.name = copyFrom.name;
      this.location = copyFrom.location;

      // if defined, use options, else copy from createFrom
      if (options.start_time !== undefined && options.end_time !== undefined && options.looped !== undefined) {
        this.setSprite(options.start_time, options.end_time, options.looped);
      } else {
        let copySprite = copyFrom.getSprite();
        this.setSprite(copySprite[0], copySprite[0] + copySprite[1], copySprite[2]);
      }
    } else if (typeof createFrom === 'string') {
      // load howl object
      this.howl_object = new Howl({
        src: [<string> createFrom],
        onload: () => {
          delete this.howl_object._sprite['__default'];

          // initlize to default sprite
          this.setSprite(0, this.howl_object.duration() * 1000, false);

          this.name = options.name;
          this.location = options.location;

          options.callback(this);
        },
        onloaderror: () => {
          collectErrorMessage('Error loading file', {name: options.name});
        }
      });
    } else {
      collectErrorMessage('Incorrect sound create from type');
    }
  }

  /** @return the absolute file location of this sound */
  public getLoc(): string {
    return this.location;
  }

  /**
   * @return the array representation of this audio object in the format: [location, start time, end time]
   */
  public toArr(): (string|number)[] {
    let arr = this.getSprite();
    if (arr[0] === 0 && arr[1] === this.howl_object.duration() * 1000) {
      return [this.location];
    } else {
      return [this.location, arr[0], arr[0] + arr[1]];
    }
  }

  /**
   * expose the howl object play method
   */
  public play(): void {
    this.playID = this.howl_object.play(this.id.toString());
  }

  /**
   * expose the howl object pause method
   */
  public pause(): void {
    this.howl_object.pause(this.playID);
  }

  /**
   * expose the howl object seek method
   */
  public seek(seekTo?: number): number {
    if (seekTo === undefined) {
      // return the position of this sounds id
      return this.howl_object.seek(this.playID);
    } else {
      this.howl_object.seek(seekTo, this.playID);
    }

    return 0;
  }

  /**
   * expose the howl object stop method
   */
  public stop(): void {
    this.howl_object.stop(this.playID);
  }

  /** @return the base-64 source string for this sound */
  public getSrc(): string {
    return this.howl_object._src;
  }

  /** @return true if this sound is playing */
  public playing(): boolean {
    return this.howl_object.playing(this.playID);
  }

  /** @return the duration in seconds of this sound */
  public duration(): number {
    return this.howl_object.duration();
  }

  /**
   * ===================
   * Howl Sprite Wrapper
   * ===================
   */

  /** @return the howl sprite object in the format [start time, duration, loop], where the times are in milliseconds */
  private getSprite(): [number, number, boolean] {
    return this.howl_object._sprite[this.id.toString()];
  }

  /**
   * edit the sound loop flag
   */
  public setLoop(loop: boolean) {
    let curSprite = this.getSprite();
    this.howl_object._sprite[this.id.toString()] = [curSprite[0], curSprite[1], loop];
  }

  /**
   * edit the sound in and out points. IMPORTANT: st and et mush be in milliseconds
   */
  public editSprite(st: number, et: number) {
    let curSprite = this.getSprite();
    this.howl_object._sprite[this.id.toString()] = [st, et - st, curSprite[2]];
  }

  /** set this sounds sprite to the given values */
  private setSprite(st: number, et: number, loop: boolean) {
    this.howl_object._sprite[this.id.toString()] = [st, et - st, loop];
  }
}

/** the options for the sound constructor */
interface SoundOptions {
  name?: string;
  location?: string;
  looped?: boolean;
  start_time?: number;
  end_time?: number;
  callback?: (sound: Sound) => void;
}
