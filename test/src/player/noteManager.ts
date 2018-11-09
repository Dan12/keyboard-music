/// <reference path="note.ts"/>

class NoteManager {
  private notes: Note[];
  private playbackIDX: number;

  private static instance: NoteManager = new NoteManager();

  private constructor() {
    this.notes = [];
    this.playbackIDX = 0;
  }

  public static NoteManager() {
    return this.instance;
  }

  public getNoteByPos(x: number, y: number): Note {
    let nb = Note.positionToNotePos(x, y);
    for (let n of this.notes) {
      if (n.noteID === nb.n && n.startBeat === nb.b) {
        return n;
      }
    }
    return null;
  }

  public addNote(n: Note) {
    for (let i = 0; i < this.notes.length; i++) {
      if (n.startBeat <= this.notes[i].startBeat) {
        this.notes.splice(i, 0, n);
        return;
      }
    }
    this.notes.push(n);
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

  public getNotes() {
    return this.notes;
  }
}