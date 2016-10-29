/// <reference path="./file.ts"/>

/**
 * A file manager for managing all of the sounds
 */
class FileManager {

  private files: {};
  private currentDirectory: string;

  constructor() {
    this.files = {
      'misc': []
    };
    this.currentDirectory = 'misc';
  }

  public addDirectory(name: string) {
    this.files[name] = [];
    this.currentDirectory = name;
  }

  public addFile(name: string, data: string) {
    name = name.substring(name.lastIndexOf('/') + 1, name.length);
    let newHowl =
    this.files[this.currentDirectory][name] = new SoundFile(
        name,
        new Howl({
          urls: [data],
        })
      );
  }

  public getSound(dir: string, name: string): SoundFile {
    let soundFile = this.files[dir][name];
    if (soundFile === undefined) {
      console.log(`The file ${dir}/${name} does not exist`);
    }

    return soundFile;
  }
}
