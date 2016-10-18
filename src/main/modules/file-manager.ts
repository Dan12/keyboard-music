/// <reference path="./file.ts"/>

/**
 * A file manager for managing all of the sounds
 */
class FileManager {

  private files: SoundFile[];

  constructor() {
    this.files = [];
  }

  public addFile(name: string, data: string) {
    let newHowl =
    this.files.push(
      new SoundFile(
        name,
        new Howl({
          urls: [data],
        })
      )
    );
  }
}
