/// <reference path="selector.ts"/>

class Note implements Selectable {
  public noteID: number;
  public startBeat: number;
  public length: number;
  public noteElem: HTMLElement;

  public top: number;
  public left: number;
  public width: number;

  public constructor(n: number, s: number, l: number) {
    this.noteID = n;
    this.startBeat = s;
    this.length = l;

    this.noteElem = DomUtils.makeElt("div", {class: "note"}, "");

    this.setNotePosition();
    this.updateRealNotePos();
  }

  public select() {
    this.noteElem.classList.add("selected");
  }

  public selected() {
    return this.noteElem.classList.contains("selected");
  }

  public toggleSelect() {
    if (this.selected()) {
      this.noteElem.classList.remove("selected");
    } else {
      this.noteElem.classList.add("selected");
    }
  }

  public deselect() {
    this.noteElem.classList.remove("selected");
  }

  private static DEFAULT_LENGTH = 1;

  public static positionToNotePos(x: number, y: number): {n: number, b: number} {
    return {n: Math.floor(y / 19), b: Math.floor(x / 60)};
  }

  public static positionToNote(x: number, y: number): Note {
    let noteId = Math.floor(y / 19);
    let startBeat = Math.floor(x / 60);
    return new Note(noteId, startBeat, Note.DEFAULT_LENGTH);
  }

  /**
   * Set the internal CSS postion of this element
   */
  public setNotePosition() {
    this.left = this.startBeat * 60;
    this.top = this.noteID * 19;
    this.length = this.length * 59;
  }

  /**
   * Update the actual CSS position properties of this element
   */
  public updateRealNotePos() {
    this.noteElem.style.top = this.top + "px";
    this.noteElem.style.left = this.left + "px";
    this.noteElem.style.width = this.length + "px";
  }

  /**
   * Move the note by dy,dx
   */
  public moveNotePos(dx: number, dy: number) {
    this.left += dx;
    this.top += dy;
  }

  /**
   * set the note to x,y
   */
  public setNotePos(x: number, y: number) {
    this.left = x;
    this.top = y;
  }

  /**
   * get note x,y
   */
  public getNotePos() {
    return {x: this.left, y: this.top};
  }

  /**
   * Set the note properties from the position and snap the positions
   */
  public setNoteProps() {
    this.startBeat = Math.floor(this.left / 60);
    this.noteID = Math.floor(this.top / 19);
    this.left = this.startBeat * 60;
    this.top = this.noteID * 19;
  }
}