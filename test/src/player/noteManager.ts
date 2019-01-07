/// <reference path="note.ts"/>

class NoteManager {
  private notes: Note[];
  private playbackIDX: number;

  private static instance: NoteManager = new NoteManager();

  private maxLength: number;

  private constructor() {
    this.clear();
  }

  public static NoteManager() {
    return this.instance;
  }

  public clear() {
    this.notes = [];
    this.playbackIDX = 0;
    this.maxLength = 0;
  }

  public getMaxNoteBeat() {
    return this.maxLength;
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

    if (n.startBeat + n.length > this.maxLength) {
      this.maxLength = n.startBeat + n.length;
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

  public startPlayBack(beat: number) {
    for (let i = 0; i < this.notes.length; i++) {
      if (this.notes[i].startBeat >= beat) {
        this.playbackIDX = i;
        break;
      }
    }
  }

  public getNextNote(curBeat: number) {
    if (this.notes[this.playbackIDX].startBeat < curBeat) {
      return this.notes[this.playbackIDX++];
    }
    return null;
  }

  public getNotes() {
    return this.notes;
  }
}