/**
 * An object representing a sound file with a howl object and name
 */
class SoundFile {

  private sound: Howl;
  private name: string;

  constructor(name: string, sound: Howl) {
    this.name = name;
    this.sound = sound;
  }
}
