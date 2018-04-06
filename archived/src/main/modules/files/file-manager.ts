/// <reference path="./directory.ts"/>

// TODO add support for local upload, probably not in here
// TODO sort files and sub directories by name

/**
 * A file manager for managing all of the sounds.
 * @static
 */
class FileManager {

  // define several file directories with a base location pointing to a directory
  private files: {[name: string]: Directory};

  // stores the physical location of each base dir
  private rootLocations: {[name: string]: string};

  // the base directory for all zip files
  private baseSongDir = 'sounds/';

  private static instance: FileManager;

  /**
   * @return the singleton instance of this class
   */
  public static getInstance(): FileManager {
    if (FileManager.instance === undefined) {
      FileManager.instance = new FileManager();
    }

    return FileManager.instance;
  }

  private constructor() {
    this.files = {};
    this.rootLocations = {};
  }

  /**
   * add a base directory and it's string location to the file manager
   * @param name the base directory name
   * @param location the backend file location
   */
  public addBaseDir(name: string, location: string) {
    if (this.rootLocations[name] === undefined) {
      this.rootLocations[name] = location;
    } else {
      collectWarningMessage('Warning: Base directory already exists. Will not overwrite: ' + name + ',' + location);
    }

    // if the base directory doesn't exists yet, create it
    if (this.files[name] === undefined) {
      this.files[name] = new Directory(name, FileGUI.getInstance().asElement());
    }
  }

  /**
   * @param the base file name
   * @return the backend location associated with the given base file name
   */
  public getRootLocation(base: string): string {
    return this.rootLocations[base];
  }

  /**
   * add the given file with the data to the file manager
   * @method addFile
   * @param baseLocation the base file location
   * @param name the file name
   * @param data the file data
   */
  public addFile(baseLocation: string, name: string, data: string, callback: () => void) {
    if (this.validFile(name)) {
      let fileName = this.trimName(name);

      if (this.files[baseLocation] === undefined) {
        collectErrorMessage('Error: Never initliaized Base Directory');
      } else {
        // add the file to the base directory
        this.files[baseLocation].addFile(fileName, data, baseLocation + '/' + fileName, callback);
      }
    } else {
      collectErrorMessage('Add file error, invalid name', name);
    }
  }

  /** make sure that the given given file name is from a valid zip file */
  private validFile(name: string): boolean {
    return name.startsWith(this.baseSongDir);
  }

  /** trim the base file name off of the file name */
  private trimName(name: string): string {
    return name.substring(this.baseSongDir.length, name.length);
  }

  /**
   * find the file with at the given location.
   * Returns undefined if the file does not exist
   * @method getSound
   * @return the file
   */
  public getSound(basedir: string, location: string): Sound {
    return this.files[basedir].getFile(location);
  }

  /**
   * clear all file data
   * @method clearFiles
   */
  public clearFiles() {
    this.files = {};

    this.rootLocations = {};

    FileGUI.getInstance().notifyClear();
  }
}
