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
   * The howler js object which this class exposes a simple api for
   * @property howl_object
   * @type Howl
   * @default undefined
   */
  private howl_object: Howl;

  private name: string;

  private asSprite: boolean;

  public constructor(name: string, howlObj: Howl, looped: boolean, start_time: number, end_time: number) {
    this.name = name;
    this.howl_object = howlObj;

    this.asSprite = false;

    if (start_time !== undefined && end_time !== undefined) {
      this.howl_object.sprite({sprite: [start_time, end_time - start_time]});
    }
  }

  /**
   * expose the howl object play method
   * @method play
   */
  public play(): void {
    if (this.asSprite) {
      this.howl_object.play('sprite');
    } else {
      this.howl_object.play();
    }
  }

  /**
   * expose the howl object stop method
   * @method stop
   */
  public stop(): void {
    this.howl_object.stop();
  }

}
