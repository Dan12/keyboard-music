class Note {
  public noteID: number;
  public startBeat: number;
  public length: number;

  public constructor(n: number, s: number, l: number) {
    this.noteID = n;
    this.startBeat = s;
    this.length = l;
  }
}

class Notes {
  private notes: Note[];

  public addNote(n: Note) {
    // TODO
  }

  public removeNote(n: Note) {
    // TODO
  }

  public startPlayBack(time: number) {
    // TODO
  }

  public getNextNote() {
    // TODO
  }
}