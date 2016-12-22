/**
 * An object representing a sound file with a howl object and name
 * @class SoundFile
 * @constructor
 * @param {Howl} sound the howl sound object
 * @param {String} name the file name
 */
class SoundFile {

  public sound: Howl;
  public name: string;

  constructor(name: string, sound: Howl) {
    this.name = name;
    this.sound = sound;
  }
}
