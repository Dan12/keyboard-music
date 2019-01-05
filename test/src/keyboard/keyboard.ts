/// <reference path="./keyboardKey.ts"/>
/// <reference path="./soundpackSwitcher.ts"/>

class Keyboard extends DomElt {

  public rows: KeyboardKey[][];
  private numRows = 4;
  private numCols = 12;
  private soundpackSwitcher: SoundpackSwitcher;

  constructor() {
    super("div", {id: "keyboard-container"}, "");

    const keyboard = DomUtils.makeElt("div", {id: "keyboard", class: "vertical-align"}, "");
    this.elt.appendChild(keyboard);

    this.rows = [];
    // push row elements and new keyboard key elements to each row
    for (let r = 0; r < this.numRows; r++) {
      this.rows.push([]);
      let nextRow = DomUtils.makeElt("div", {class: "row"}, "");
      keyboard.appendChild(nextRow);
      for (let c = 0; c < this.numCols; c++) {
        let newKey = new KeyboardKey(Globals.DefaultKeyStrings[r * 4 + c]);
        this.rows[r].push(newKey);
        nextRow.appendChild(newKey.getElt());
      }
    }

    this.soundpackSwitcher = new SoundpackSwitcher();
    keyboard.appendChild(this.soundpackSwitcher.getElt());
  }

  public setPack(pack: number) {
    this.soundpackSwitcher.setPack(pack);
  }
}