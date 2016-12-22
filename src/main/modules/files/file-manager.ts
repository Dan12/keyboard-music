/// <reference path="./file.ts"/>

/**
 * A file manager for managing all of the sounds.
 * @class FileManager
 * @static
 */
class FileManager {

  private files: Directory;

  private baseSongDir = 'sounds';

  private static instance: FileManager;

  /**
   * return the singleton instance of this class
   * @method getInstance
   * @static
   * @return {FileManager} the instance
   */
  public static getInstance(): FileManager {
    if (FileManager.instance === undefined) {
      FileManager.instance = new FileManager();
    }

    return FileManager.instance;
  }

  private constructor() {
    this.files = new Directory();
  }

  /**
   * add the given file with the data to the file manager
   * @method addFile
   * @param {String} name the file name
   * @param {String} data the file data
   */
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

  /**
   * find the file with at the given location.
   * Returns undefined if the file does not exist
   * @method getSound
   * @return {SoundFile} the file
   */
  public getSound(location: string): SoundFile {
    return this.files.getFile(location);
  }

  /**
   * clear all file data
   * @method clearFiles
   */
  public clearFiles() {
    this.files = new Directory();

    FileGUI.getInstance().notifyClear();
  }
}

/**
 * A directory class with files and recursive subdirectories
 * @class Directory
 */
class Directory {
  private files: {[name: string]: SoundFile};
  private subdirectories: {[name: string]: Directory};

  constructor() {
    this.files = {};
    this.subdirectories = {};
  }

  /**
   * recursively add the file to this directory.
   * Create new subdirectories if needed.
   * @method addFile
   * @param {string} name the file name relative to this directory
   * @param {String} data the file data
   * @param {String} fullname the absolute file path
   */
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

  // called when a file is loaded to add it to the file data structure and gui
  private loadedFile(name: string, sound: Howl, fullname: string) {
    this.files[name] = new SoundFile(name, sound);

    FileGUI.getInstance().notifyAdd(fullname);
  }

  /**
   * recursively get the given file
   * @method getFile
   * @param {String} location the relative file path to this directory
   */
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
