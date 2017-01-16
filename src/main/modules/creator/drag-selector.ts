/// <reference path="./drag-multi-payload.ts"/>

/** a drag selecting element to select keys on the square keyboard */
class DragSelector extends DomElement {

  private static instance: DragSelector;

  private inX: number;
  private inY: number;
  private outX: number;
  private outY: number;

  private x: number;
  private y: number;
  private width: number;
  private height: number;

  private static MAX_ROWS = 4;
  private static MAX_COLS = 4;

  private inRow: number;
  private inCol: number;
  private outRow: number;
  private outCol: number;

  private offsetTop: number;
  private offsetLeft: number;

  private multiPayload: DragMultiPayload;

  public static getInstance(): DragSelector {
    if (DragSelector.instance === undefined) {
      DragSelector.instance = new DragSelector();
    }

    return DragSelector.instance;
  }

  private constructor() {
    super(new JQW('<div id="drag_selector" style="z-index: 100;"></div>'));

    this.inX = 0;
    this.inY = 0;
    this.outX = 0;
    this.outY = 0;
  }

  public setParentOffsets(t: number, l: number) {
    this.offsetTop = t;
    this.offsetLeft = l;
  }

  public setStartPoint(x: number, y: number) {
    this.inX = x;
    this.inY = y;
    this.outX = x;
    this.outY = y;

    this.setDims();

    this.clearPayload();
  }

  public updateEndPoint(x: number, y: number) {
    this.outX = x;
    this.outY = y;

    this.setDims();

    this.setSelection();
  }

  private setSelection() {
    // if the selection on the square keyboard got nothing, try the map to keyboard
    if (!this.testSelection(true)) {
      this.testSelection(false);
    }
  }

  private testSelection(square: boolean): boolean {
    let keyboard: Keyboard;
    if (square)
      keyboard = Creator.getInstance().getSquareKeyboard();
    else
      keyboard = Creator.getInstance().getMapToKeyboard();

    let boardDim = keyboard.asElement().getDomObj().getBoundingClientRect();
    let singleKey = keyboard.getKey(0, 0).asElement();
    let keyMargin = parseInt(singleKey.css('margin'));
    let keyDim = singleKey.getDomObj().getBoundingClientRect();
    let keyWidth = keyDim.width + keyMargin * 2;
    let keyHeight = keyDim.height + keyMargin * 2;
    let colStart = Math.floor((this.x + this.offsetLeft - boardDim.left + keyMargin) / keyWidth);
    if (colStart < 0)
      colStart = 0;
    let rowStart = Math.floor((this.y + this.offsetTop - boardDim.top + keyMargin) / keyHeight);
    if (rowStart < 0)
      rowStart = 0;
    let colEnd = Math.floor((this.x + this.width + this.offsetLeft - boardDim.left - keyMargin) / keyWidth);
    if (colEnd >= keyboard.getNumCols())
      colEnd = keyboard.getNumCols() - 1;
    let rowEnd = Math.floor((this.y + this.height + this.offsetTop - boardDim.top - keyMargin) / keyHeight);
    if (rowEnd >= keyboard.getNumRows())
      rowEnd = keyboard.getNumRows() - 1;

    if (colStart <= colEnd && rowStart <= rowEnd) {
      let maxRows = square ? DragSelector.MAX_ROWS : keyboard.getNumRows();
      let maxCols = square ? DragSelector.MAX_COLS : keyboard.getNumCols();
      if (colEnd - colStart >= maxCols)
        colEnd = colStart + maxCols - 1;
      if (rowEnd - rowStart >= maxRows)
        rowEnd = rowStart + maxRows - 1;

      let keys = <KeyboardKey[]>[];

      this.clearPayload();

      for (let r = rowStart; r <= rowEnd; r++) {
        for (let c = colStart; c <= colEnd; c++) {
          let key = keyboard.getKey(r, c);
          keys.push(key);
          if (
            (square && PayloadAlias.getInstance().getSquareKey(key) !== undefined) ||
            (!square && PayloadAlias.getInstance().getSongKey(key) !== undefined)
          ) {
            key.highlight();
          }
        }
      }

      this.multiPayload = new DragMultiPayload(keys, square);

      return true;
    } else {
      this.clearPayload();
    }

    return false;
  }

  private clearPayload(keyboard?: Keyboard) {
    if (this.multiPayload !== undefined && !this.multiPayload.isPayload()) {
      if (keyboard === undefined) {
        Creator.getInstance().getSquareKeyboard().unhighlight();
        Creator.getInstance().getMapToKeyboard().unhighlight();
      } else
        keyboard.unhighlight();
      MousePayload.clearMultiPayload();
      this.multiPayload = undefined;
    }
  }

  private setDims() {
    this.x = this.inX;
    this.y = this.inY;
    this.width = this.outX - this.inX;
    this.height = this.outY - this.inY;

    if (this.width < 0) {
      this.x = this.outX;
      this.width *= -1;
    }

    if (this.height < 0) {
      this.y = this.outY;
      this.height *= -1;
    }

    this.asElement().css({
      'top': this.y + 'px',
      'left': this.x + 'px',
      'height': this.height + 'px',
      'width': this.width + 'px'
    });
  }

  public pressedKey(key: number) {
    if (key === 8 && this.multiPayload !== undefined) {
      if (this.multiPayload.deletePressed()) {
        this.multiPayload = undefined;
      }
    }
  }

  public setEndPoints() {
    this.inX = 0;
    this.inY = 0;
    this.outX = 0;
    this.outY = 0;
    this.setDims();

    MousePayload.setMultiPayload(this.multiPayload);
  }
}
