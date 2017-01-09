/**
 * An object representing a sound file with a howl object and name
 */
class SoundFile extends Payload {

  /** the howl sound object */
  public sound: Howl;

  /** the file name */
  public name: string;

  /** the file location */
  public location: string;

  constructor(name: string, sound: Howl, location: string) {
    super(new JQW('<div class="file">' + name + '</div>'));

    this.name = name;
    this.sound = sound;
    this.location = location;
  }
}
