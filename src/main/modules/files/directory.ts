/**
 * A directory class with files and recursive subdirectories
 */
class Directory extends SinglePayload {
  private files: {[name: string]: Sound};
  private subdirectories: {[name: string]: Directory};

  private subDirElement: JQW;

  private fileSize: number;
  private dirSize: number;

  constructor(name: string, parent: JQW) {
    super(new JQW('<div class="subdirectory-name">' + name + '</div>'));
    this.subDirElement = new JQW('<div class="subdirectory"></div>');

    parent.append(this.asElement());
    parent.append(this.subDirElement);

    this.asElement().click(() => {
      this.subDirElement.toggle(100);
    });

    this.files = {};
    this.subdirectories = {};

    this.fileSize = 0;
    this.dirSize = 0;
  }

  /**
   * @return the number of files in this directory. Does not recursively count other directories
   */
  public numFiles(): number {
    return this.fileSize;
  }

  /**
   * @return the number of sub directories in this directory
   */
  public numDirs(): number {
    return this.dirSize;
  }

  /**
   * @return the first directory in the sub directories map
   */
  public getFirstDir(): Directory {
    let key =  Object.keys(this.subdirectories)[0];
    return this.subdirectories[key];
  }

  /**
   * @return an array of the files in this directory only; no files returned from any subdirectories
   */
  public getFiles(): string[] {
    return Object.keys(this.files);
  }

  /**
   * recursively add the file to this directory.
   * Create new subdirectories if needed.
   * @param location the location of the file relative to this directory
   * @param data the file data
   * @param fullname the full location of the file
   */
  public addFile(location: string, data: string, fullname: string, callback: () => void) {
    // if this is still a subdirectory
    if (location.indexOf('/') !== -1) {
      // get the name of the subdirectory
      let dir = location.substring(0, location.indexOf('/'));
      // if this subdirectory does not exist, make a new one
      if (this.subdirectories[dir] === undefined) {
        this.subdirectories[dir] = new Directory(dir, this.subDirElement);
        this.dirSize++;
      }

      // continue recursion with new relative file location
      this.subdirectories[dir].addFile(location.substring(location.indexOf('/') + 1, location.length), data, fullname, callback);
    } else {
      if (this.files[location] === undefined) {
        let options = {
          name: location,
          location: fullname,
          callback: (sound: Sound) => {
            this.loadedFile(location, sound, fullname);

            callback();
          }
        };
        new Sound(data, options);
      } else {
        collectWarningMessage('Warning: File already exists. Will not overwrite: ' + fullname);
        callback();
      }
    }
  }

  // called when a file is loaded to add it to the file data structure and gui
  private loadedFile(name: string, sound: Sound, fullname: string) {
    this.files[name] = sound;
    this.fileSize++;

    this.subDirElement.append(sound.asElement());

    sound.asElement().click(function() {
      Toolbar.getInstance().inspectSound(sound, sound, false);
    });
  }

  /**
   * recursively get the given file
   * @param location the relative file path to this directory
   */
  public getFile(location: string): Sound {
    if (location.indexOf('/') !== -1) {
      let dir = location.substring(0, location.indexOf('/'));
      if (this.subdirectories[dir] === undefined) {
        collectErrorMessage(`The directory ${dir} does not exist`);
        return undefined;
      }
      return this.subdirectories[dir].getFile(location.substring(location.indexOf('/') + 1, location.length));
    } else {
      let file = this.files[location];
      if (file === undefined) {
        collectErrorMessage(`The file ${location} does not exist`);
      }
      return file;
    }
  }
}
