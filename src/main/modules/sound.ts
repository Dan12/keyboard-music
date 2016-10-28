/**
 * A class to abstract a howl object
 * @class Sound
 * @constructor
 * @param filename {string} the filepath for the sound
 * @param looped {boolean} sound the sound loop or not
 * @param [start_time] {number} what time to start the sound at
 * @param [end_time] {number} what time to end the sound at
 */
class Sound {

  /**
   * THe howler js object which this class exposes a simple api for
   * @property howl_object
   * @type Howl
   * @default undefined
   */
  private howl_object: Howl = undefined;

  public constructor(filename: string, looped: boolean, start_time?: number, end_time?: number) {
    this.howl_object = new Howl({
      urls: [filename],
      loop: looped
    });
  }

  /**
   * expose the howl object play method
   * @method play
   */
  public play(): void {
    this.howl_object.play();
  }

  /**
   * expose the howl object stop method
   * @method stop
   */
  public stop(): void {
    this.howl_object.stop();
  }

}
