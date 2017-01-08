/**
 * A directory class with files and recursive subdirectories
 * @class Directory
 */
class Directory extends Payload {
  private files: {[name: string]: SoundFile};
  private subdirectories: {[name: string]: Directory};

  private subDirElement: JQuery;

  private fileSize: number;
  private dirSize: number;

  constructor(name: string, parent: JQuery) {
    super($('<div class="subdirectory-name">' + name + '</div>'));
    this.subDirElement = $('<div class="subdirectory"></div>');

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

  public numFiles() {
    return this.fileSize;
  }

  public numDirs() {
    return this.dirSize;
  }

  public getFirstDir(): Directory {
    let key =  Object.keys(this.subdirectories)[0];
    return this.subdirectories[key];
  }

  public getFiles(): string[] {
    return Object.keys(this.files);
  }

  /**
   * recursively add the file to this directory.
   * Create new subdirectories if needed.
   * @method addFile
   * @param {String} location the location of the file relative to this directory
   * @param {String} data the file data
   * @param {String} fullname the full location of the file
   */
  public addFile(location: string, data: string, fullname: string) {
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
      this.subdirectories[dir].addFile(location.substring(location.indexOf('/') + 1, location.length), data, fullname);
    } else {
      if (this.files[location] === undefined) {
        // only add the file to the file manager when it has been loaded
        let _this_ = this;
        // create a new howl object and pass it the load file constructor
        new Howl({
          urls: [data],

          onload: function() {
            // this refers to the howl object
            _this_.loadedFile(location, this, fullname);
          },
          onloaderror: function() {
            collectErrorMessage('Error loading file', {name: fullname, d: data});
          }
        });
      } else {
        collectWarningMessage('Warning: File already exists. Will not overwrite: ' + fullname);
      }
    }
  }

  // called when a file is loaded to add it to the file data structure and gui
  private loadedFile(name: string, sound: Howl, fullname: string) {
    let new_sound = new SoundFile(name, sound, fullname);
    this.files[name] = new_sound;
    this.fileSize++;

    this.subDirElement.append(new_sound.asElement());

    new_sound.asElement().click(function() {
      Toolbar.getInstance().inspectFile(fullname, new_sound);
    });
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
