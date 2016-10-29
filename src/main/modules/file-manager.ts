/// <reference path="./file.ts"/>

/**
 * A file manager for managing all of the sounds
 */
class FileManager {

  private files: Directory;

  constructor() {
    this.files = new Directory();
  }

  public addFile(name: string, data: string) {
    this.files.addFile(name, data);
  }

  public getSound(location: string): SoundFile {
    return this.files.getFile(location);
  }
}

class Directory {
  private files: {[name: string]: SoundFile};
  private subdirectories: {[name: string]: Directory};

  constructor() {
    this.files = {};
    this.subdirectories = {};
  }

  public addFile(name: string, data: string) {
    if (name.indexOf('/') !== -1) {
      let dir = name.substring(0, name.indexOf('/'));
      if (this.subdirectories[dir] === undefined) {
        this.subdirectories[dir] = new Directory();
      }
      this.subdirectories[dir].addFile(name.substring(name.indexOf('/') + 1, name.length), data);
    } else {
      this.files[name] = new SoundFile(
        name,
        new Howl({
          urls: [data],
        })
      );
    }
  }

  public getFile(location: string): SoundFile {
    if (location.indexOf('/') !== -1) {
      let dir = location.substring(0, location.indexOf('/'));
      if (this.subdirectories[dir] === undefined) {
        console.log(`The directory ${dir} does not exist`);
        return undefined;
      }
      return this.subdirectories[dir].getFile(location.substring(location.indexOf('/') + 1, location.length));
    } else {
      let file = this.files[location];
      if (file === undefined) {
        console.log(`The file ${location} does not exist`);
      }
      return file;
    }
  }
}
