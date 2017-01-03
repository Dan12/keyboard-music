/// <reference path="./file.ts"/>
/// <reference path="./directory.ts"/>

/**
 * A file manager for managing all of the sounds.
 * @class FileManager
 * @static
 */
class FileManager {

  // define several file directories with a base location pointing to a directory
  private files: {[name: string]: Directory};

  private baseSongDir = 'sounds/';

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
    // create the root file directory and append the element
    this.files = {};
  }

  /**
   * add the given file with the data to the file manager
   * @method addFile
   * @param {String} baseLocation the base file location
   * @param {String} name the file name
   * @param {String} data the file data
   */
  public addFile(baseLocation: string, name: string, data: string) {
    if (this.validFile(name)) {
      let fileName = this.trimName(name);
      // if the base directory doesn't exists yet, create it
      if (this.files[baseLocation] === undefined) {
        this.files[baseLocation] = new Directory(baseLocation, FileGUI.getInstance().asElement());
      }
      // add the file to the base directory
      this.files[baseLocation].addFile(fileName, data, fileName);
    } else {
      collectErrorMessage('Add file error, invalid name', name);
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
  public getSound(basedir: string, location: string): SoundFile {
    return this.files[basedir].getFile(location);
  }

  /**
   * clear all file data
   * @method clearFiles
   */
  public clearFiles() {
    this.files = {};

    FileGUI.getInstance().notifyClear();
  }
}
