/**
 * A class to abstract a howl object
 */
class Sound {

  /**
   * The howler js object which this class exposes a simple api for
   */
  private howl_object: Howl;

  private name: string;

  private asSprite: boolean;

  private start_time: number;
  private end_time: number;

  /**
   * @param name the filepath for the sound
   * @param howlObj the howler js object of this sound
   * @param looped sound the sound loop or not
   * @param start_time what time to start the sound at
   * @param end_time what time to end the sound at
   */
  public constructor(name: string, howlObj: Howl, looped: boolean, start_time?: number, end_time?: number) {
    this.name = name;
    this.howl_object = howlObj;

    this.asSprite = false;

    if (start_time !== undefined && end_time !== undefined) {
      this.howl_object.sprite({sprite: [start_time, end_time - start_time]});
      this.asSprite = true;
      this.start_time = start_time;
      this.end_time = end_time;
      console.log('sprite');
    }
  }

  /**
   * @return the array representation of this audio object in the format: [location, start time, end time]
   */
  public toArr(): (string|number)[] {
    if (this.start_time) {
      return [this.name, this.start_time, this.end_time];
    } else {
      return [this.name];
    }
  }

  /**
   * expose the howl object play method
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
   */
  public stop(): void {
    this.howl_object.stop();
  }

}
