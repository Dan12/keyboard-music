/**
 * An object representing a sound file with a howl object and name
 */
export class File {

  private sound: Howl;
  private name: string;

  constructor(name: string, sound: Howl) {
    this.name = name;
    this.sound = sound;
    console.log(this.name);
  }
}
