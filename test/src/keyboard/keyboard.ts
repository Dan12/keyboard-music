/// <reference path="./keyboardKey.ts"/>
/// <reference path="./soundpackSwitcher.ts"/>

class Keyboard extends DomElt {

  public rows: KeyboardKey[][];
  private numRows = 4;
  private numCols = 12;
  private soundpackSwitcher: SoundpackSwitcher;
  public readonly keyboard: HTMLElement;

  constructor() {
    super("div", {id: "keyboard-container"}, "");

    this.keyboard = DomUtils.makeElt("div", {id: "keyboard", class: "vertical-align"}, "");
    this.elt.appendChild(this.keyboard);

    this.rows = [];
    // push row elements and new keyboard key elements to each row
    for (let r = 0; r < this.numRows; r++) {
      this.rows.push([]);
      let nextRow = DomUtils.makeElt("div", {class: "row"}, "");
      this.keyboard.appendChild(nextRow);
      for (let c = 0; c < this.numCols; c++) {
        let newKey = new KeyboardKey(Globals.DefaultKeyStrings[r * 12 + c]);
        this.rows[r].push(newKey);
        nextRow.appendChild(newKey.getElt());
      }
    }

    this.soundpackSwitcher = new SoundpackSwitcher();
    this.keyboard.appendChild(this.soundpackSwitcher.getElt());
  }

  public setPack(pack: number) {
    this.soundpackSwitcher.setPack(pack);
  }
}