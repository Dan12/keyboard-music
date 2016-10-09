import { File } from './file';
import { Howl } from 'howler';

/**
 * A file manager for managing all of the sounds
 */
export class FileManager {

  private files: File[];

  constructor() {
    this.files = [];
  }

  public addFile(name: string, data: string) {
    let newHowl =
    this.files.push(
      new File(
        name,
        new Howl({
          urls: [data],
        })
      )
    );
  }
}
