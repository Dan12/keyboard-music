/// <reference path="./file.ts"/>

/**
 * A file manager for managing all of the sounds.
 */
class FileManager {

  public files: Directory;

  private baseSongDir = 'sounds';

  private static instance: FileManager;

  public static getInstance(): FileManager {
    if (FileManager.instance === undefined) {
      FileManager.instance = new FileManager();
    }

    return FileManager.instance;
  }

  private constructor() {
    this.files = new Directory();
  }

  public addFile(name: string, data: string) {
    if (this.validFile(name)) {
      let fileName = this.trimName(name);
      this.files.addFile(fileName, data, fileName);
    } else {
      console.log('invalid file');
    }
  }

  private validFile(name: string): boolean {
    return name.startsWith(this.baseSongDir);
  }

  private trimName(name: string): string {
    return name.substring(this.baseSongDir.length, name.length);
  }

  public getSound(location: string): SoundFile {
    return this.files.getFile(location);
  }

  public clearFiles() {
    this.files = new Directory();

    FileGUI.getInstance().notifyClear();
  }
}

class Directory {
  public files: {[name: string]: SoundFile};
  public subdirectories: {[name: string]: Directory};

  constructor() {
    this.files = {};
    this.subdirectories = {};
  }

  public addFile(name: string, data: string, fullname: string) {
    if (name.indexOf('/') !== -1) {
      let dir = name.substring(0, name.indexOf('/'));
      if (this.subdirectories[dir] === undefined) {
        this.subdirectories[dir] = new Directory();
      }
      this.subdirectories[dir].addFile(name.substring(name.indexOf('/') + 1, name.length), data, fullname);
    } else {
      // only add the file to the file manager when it has been loaded
      let _this = this;
      // create a new howl object and pass it the load file constructor
      new Howl({
        urls: [data],

        onload: function() {
          // this refers to the howl object
          _this.loadedFile(name, this, fullname);
        },
        onloaderror: function() {
          console.log('error loading file');
        }
      });
    }
  }

  private loadedFile(name: string, sound: Howl, fullname: string) {
    this.files[name] = new SoundFile(name, sound);

    FileGUI.getInstance().notifyAdd(fullname);
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
