/// <reference path="../../interfaces/element.ts"/>
/// <reference path="./keyboard-key.ts"/>
/// <reference path="../../interfaces/input-reciever.ts"/>
/// <reference path="./color-manager.ts"/>
/// <reference path="./keyboard-utils.ts"/>

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

  private addKeyCallback: (r: number, c: number, sound: SoundFile) => void;

  private pressed: {};

  // TODO custom keypairs

  // a mapping from a keycode to keyboard row and column
  private keyMap = {};

  public constructor(type: KeyBoardType) {
    super($('<div class="keyboard"></div>'));

    let size = KeyboardUtils.getKeyboardSize(type);
    this.numRows = size.rows;
    this.numCols = size.cols;

    if (type !== KeyBoardType.STANDARD) {
      this.modifierActive = false;
    }

    let keyHook = (payload: Payload, r: number, c: number) => {
      this.runAddKeyCallback(r, c, payload);
    };

    this.rows = [];
    // push row elements and new keyboard key elements to each row
    for (let r = 0; r < this.numRows; r++) {
      this.rows.push([]);
      let nextRow = $(`<div class="row" id="row_${r}"></div>`);
      this.asElement().append(nextRow);
      for (let c = 0; c < this.numCols; c++) {
        let nextCell = new KeyboardKey(KeyboardUtils.keyboardSymbols[r % 4][c], r, c, keyHook);
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
        this.keyMap[KeyboardUtils.keyPairs[i][j]] = [i, j];
        // add the backup pairs
        if (KeyboardUtils.backupPairs[i][j] !== KeyboardUtils.keyPairs[i][j]) {
          this.keyMap[KeyboardUtils.backupPairs[i][j]] = [i, j];
        }
      }
    }

    this.pressed = {};

    this.resize(1);

    this.setVisible();

    this.colorManager = new ColorManager(this.rows);
  }

  public setAddSoundCallback(callback: (r: number, c: number, sound: SoundFile) => void) {
    this.addKeyCallback = callback;
  }

  private runAddKeyCallback(r: number, c: number, payload: any) {
    if (payload instanceof SoundFile)
      if (this.addKeyCallback)
        this.addKeyCallback(r, c, <SoundFile> payload);
      else
        collectErrorMessage('Key Callback does not exist on keyboard');
    else
      collectErrorMessage('Payload type does not match soundfile type in keyboard', payload);
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
    if (payload instanceof Directory) {
      let lowestDir = <Directory> payload;
      while (lowestDir.numFiles() === 0 && lowestDir.numDirs() > 0) {
        lowestDir = lowestDir.getFirstDir();
      }
      let sounds = lowestDir.getFiles();
      for (let sound of sounds) {
        let sLetter = sound.toLowerCase().charCodeAt(0) - 97;
        let sNum = parseInt(sound.substring(1, sound.length));
        if (sLetter >= 0 && sLetter <= 3 && sNum >= 0 && sNum <= 15) {
          let r = Math.floor(sLetter / 2) * 4 + Math.floor(sNum / 4);
          let c = (sLetter % 2) * 4 + (sNum % 4);

          this.runAddKeyCallback(r, c, lowestDir.getFile(sound));
        }
      }
    } else {
      collectErrorMessage('Payload is not directory in keyboard');
    }
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
}
