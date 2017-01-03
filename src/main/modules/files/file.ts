/**
 * An object representing a sound file with a howl object and name
 * @class SoundFile
 * @constructor
 * @param {Howl} sound the howl sound object
 * @param {String} name the file name
 * @extends Payload
 */
class SoundFile extends Payload {

  public sound: Howl;
  public name: string;

  constructor(name: string, sound: Howl) {
    super($('<div class="file">' + name + '</div>'));

    this.name = name;
    this.sound = sound;
  }
}
