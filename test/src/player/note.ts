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
  private playbackIDX: number;

  public addNote(n: Note) {
    for (let i = 0; i < this.notes.length; i++) {
      if (n.startBeat <= this.notes[i].startBeat) {
        this.notes.splice(i, 0, n);
        break;
      }
    }
  }

  public removeNote(n: Note) {
    for (let i = 0; i < this.notes.length; i++) {
      if (n === this.notes[i]) {
        this.notes.splice(i, 1);
        break;
      }
    }
  }

  public startPlayBack(time: number) {
    for (let i = 0; i < this.notes.length; i++) {
      if (this.notes[i].startBeat >= time) {
        this.playbackIDX = i;
        break;
      }
    }
  }

  public getNextNote(curTime: number) {
    if (this.notes[this.playbackIDX].startBeat < curTime) {
      return this.notes[this.playbackIDX];
    }
    return null;
  }
}