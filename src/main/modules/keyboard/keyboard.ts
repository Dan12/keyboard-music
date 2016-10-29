/// <reference path="../../interfaces/element.ts"/>
/// <reference path="./keyboard-key.ts"/>
/// <reference path="../../interfaces/input-reciever.ts"/>

/**
 * The keyboard module to represent an html keyboard.
 *
 * @class Keyboard
 * @constructor
 */
class Keyboard extends JQElement implements InputReciever {

  private rows: KeyboardKey[][];
  private numRows = 4;
  private numCols = 12;

  private keyboardSymbols = [
    ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '-',  '='],
    ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P', '[',  ']'],
    ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', ';', '\'', '\\n'],
    ['Z', 'X', 'C', 'V', 'B', 'N', 'M', ',', '.', '/', '\\s',  'NA'],
  ];

  // ascii key mappings to array index
  private keyPairs = [
    [49, 50, 51, 52, 53, 54, 55, 56,  57,  48,  189, 187],
    [81, 87, 69, 82, 84, 89, 85, 73,  79,  80,  219, 221],
    [65, 83, 68, 70, 71, 72, 74, 75,  76,  186, 222, 13],
    [90, 88, 67, 86, 66, 78, 77, 188, 190, 191, 16,  -1]
  ];

  // alternate keys for firefox
  private backupPairs = [
    [49, 50, 51, 52, 53, 54, 55, 56,  57,  48,  173, 61],
    [81, 87, 69, 82, 84, 89, 85, 73,  79,  80,  219, 221],
    [65, 83, 68, 70, 71, 72, 74, 75,  76,  59,  222, 13],
    [90, 88, 67, 86, 66, 78, 77, 188, 190, 191, 16,  -1]
  ];

  private keyMap = {};

  constructor() {
    // TODO: show keys

    super($('<div id="keyboard"></div>'));
    this.rows = [];
    // push row elements and new keyboard key elements to each row
    for (let r = 0; r < this.numRows; r++) {
      this.rows.push([]);
      let nextRow = $(`<div class="row" id="row_${r}"></div>`);
      this.asElement().append(nextRow);
      for (let c = 0; c < this.numCols; c++) {
        let nextCell = new KeyboardKey(this.keyboardSymbols[r][c]);
        this.rows[r].push(nextCell);
        nextRow.append(this.rows[r][c].asElement());
      }
    }

    // setup the key map
    for (let i = 0; i < this.numRows; i++) {
      for (let j = 0; j < this.numCols; j++) {
        this.keyMap[this.keyPairs[i][j]] = [i, j];
        this.keyMap[this.backupPairs[i][j]] = [i, j];
      }
    }
  }

  public keyDown(key: number) {
    console.log(this.keyMap[key]);
  }

  public keyUp(key: number) {
    console.log(this.keyMap[key]);
  }

  public static getKeyboardSizeString(type: String): KeyBoardSize {
    switch (type) {
      case 'SQUARE':
        return Keyboard.getKeyboardSize(KeyBoardType.SQUARE);
      case 'DOUBLE':
        return Keyboard.getKeyboardSize(KeyBoardType.DOUBLE);
      default:
        return Keyboard.getKeyboardSize(KeyBoardType.STANDARD);
    }
  }

  public static getKeyboardSize(type: KeyBoardType): KeyBoardSize {
    switch (type) {
      case KeyBoardType.SQUARE:
        return {rows: 8, cols: 8};
      case KeyBoardType.DOUBLE:
        return {rows: 8, cols: 11};
      default: // standard
        return {rows: 4, cols: 12};
    }
  }
}

interface KeyBoardSize {
  rows: number;
  cols: number;
}

enum KeyBoardType {
  STANDARD, // original 4*12 grid
  SQUARE, // 8*8 grid like actual pad, modifier to access lower grid
  DOUBLE, // 8*11 grid, modifier to access lower grid, option to hide lower half
}
