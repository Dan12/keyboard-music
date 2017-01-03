/// <reference path="../../interfaces/element.ts"/>
/// <reference path="./keyboard-key.ts"/>
/// <reference path="../../interfaces/input-reciever.ts"/>
/// <reference path="./color-manager.ts"/>

/**
 * The keyboard module to represent an html keyboard.
 *
 * @class Keyboard
 * @extends PayloadReceiver
 */
class Keyboard extends PayloadReceiver implements InputReciever {

  private rows: KeyboardKey[][];
  private numRows = 4;
  private numCols = 12;

  // return key activates other layers
  private modifierKeyCode = 13;
  private modifierActive: boolean = undefined;
  private modifierHold = true;

  // option to show keys
  private showKeys = true;

  private colorManager: ColorManager;

  private pressed: {};

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

  // a mapping from a keycode to keyboard row and column
  private keyMap = {};

  public constructor(type: KeyBoardType) {
    super($('<div class="keyboard"></div>'));

    let size = Keyboard.getKeyboardSize(type);
    this.numRows = size.rows;
    this.numCols = size.cols;

    if (type !== KeyBoardType.STANDARD) {
      this.modifierActive = false;
    }

    this.rows = [];
    // push row elements and new keyboard key elements to each row
    for (let r = 0; r < this.numRows; r++) {
      this.rows.push([]);
      let nextRow = $(`<div class="row" id="row_${r}"></div>`);
      this.asElement().append(nextRow);
      for (let c = 0; c < this.numCols; c++) {
        let nextCell = new KeyboardKey(this.keyboardSymbols[r % 4][c]);
        this.rows[r].push(nextCell);
        nextRow.append(this.rows[r][c].asElement());

        if (r < 4) {
          nextCell.asElement().addClass('bolder');
        }
      }
    }

    let maxRows = Math.min(4, this.numRows);

    // setup the key map
    for (let i = 0; i < maxRows; i++) {
      for (let j = 0; j < this.numCols; j++) {
        this.keyMap[this.keyPairs[i][j]] = [i, j];
        // add the backup pairs
        if (this.backupPairs[i][j] !== this.keyPairs[i][j]) {
          this.keyMap[this.backupPairs[i][j]] = [i, j];
        }
      }
    }

    this.pressed = {};

    this.resize(1);

    this.setVisible();

    this.colorManager = new ColorManager(this.rows);
  }

  /**
   * @method getColorManager
   */
  public getColorManager(): ColorManager {
    return this.colorManager;
  }

  private setVisible() {
    let cssObj = {'color': this.showKeys ? '' : 'rgba(0,0,0,0)'};
    for (let r = 0; r < this.numRows; r++) {
      for (let c = 0; c < this.numCols; c++) {
        this.rows[r][c].setCSS(cssObj);
      }
    }
  }

  /**
   * @method resize
   */
  public resize(scale = 1) {
    let css = KeyboardKey.getScaleCSS(scale);

    for (let r = 0; r < this.numRows; r++) {
      for (let c = 0; c < this.numCols; c++) {
        this.rows[r][c].setCSS(css);
      }
    }
  }

  /**
   * @method centerVertical
   */
  public centerVertical() {
    this.asElement().addClass('vertical-align');
  }

  /**
   * called when the key with the given keycode is pressed down
   * @method keyDown
   * @param {number} key the keycode
   */
  public keyDown(key: number) {
    if (!this.pressed[key]) {
      if (this.modifierActive !== undefined && key === this.modifierKeyCode) {
        // if user has to hold, modifier is down
        if (this.modifierHold)
          this.modifierActive = true;
        // if user can press and release, modifier is toggled on key down
        else
          this.modifierActive = !this.modifierActive;

        this.changeModiferKeys();
      }

      let keyIdx = this.keyMap[key];
      if (keyIdx) {
        this.pressedKey(keyIdx[0] + 4 * (this.modifierActive ? 1 : 0), keyIdx[1]);
      }

      this.pressed[key] = true;
    }
  }

  /**
   * called when the key with the given keycode is released
   * @method keyUp
   * @param {number} key the keycode
   */
  public keyUp(key: number) {
    if (this.pressed[key]) {
      // only set to false if the modifier key is down and we have to hold to trigger
      if (this.modifierActive !== undefined && key === this.modifierKeyCode && this.modifierHold) {
        this.modifierActive = false;

        this.changeModiferKeys();
      }

      let keyIdx = this.keyMap[key];
      if (keyIdx) {
        this.releasedKey(keyIdx[0] + 4 * (this.modifierActive ? 1 : 0), keyIdx[1]);
      }

      delete this.pressed[key];
    }
  }

  public canReceive(payload: Payload): boolean {
    return payload instanceof Directory;
  }

  public receivePayload(payload: Payload) {
    console.log('keyboard recieved:');
    console.log(payload);
  }

  // where a key officially gets pressed
  private pressedKey(r: number, c: number) {
    this.colorManager.pressedKey(r, c);
  }

  // where a key officially gets released
  private releasedKey(r: number, c: number) {
    this.colorManager.releasedKey(r, c);
  }

  private changeModiferKeys() {
    for (let r = 0; r < this.numRows; r++) {
      for (let c = 0; c < this.numCols; c++) {
        if (r < 4) {
          if (this.modifierActive) {
            // release all keys in lower half
            this.releasedKey(r, c);
            this.rows[r][c].asElement().removeClass('bolder');
          } else {
            this.rows[r][c].asElement().addClass('bolder');
          }
        } else {
          if (this.modifierActive) {
            this.rows[r][c].asElement().addClass('bolder');
          } else {
            // release all keys in upper half
            this.releasedKey(r, c);
            this.rows[r][c].asElement().removeClass('bolder');
          }
        }
      }
    }
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
