/// <reference path="./keyboard-key.ts"/>
/// <reference path="./color-manager.ts"/>
/// <reference path="./keyboard-utils.ts"/>
/// <reference path="./soundpack-switcher.ts"/>

/**
 * The keyboard module to represent an html keyboard.
 */
class Keyboard extends DomElement {

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

  // used to keep track of currently pressed keys so that a key can only be triggered once when pressed
  private pressed: {};

  // a mapping from a keycode to keyboard row and column
  private keyMap = {};

  private static nextID = 1;

  private soundPackSwitcher: SoundPackSwitcher;

  private static assignNextID(): number {
    return Keyboard.nextID++;
  }

  private keyboardID: number;

  public constructor(type: KeyBoardType, allowTransition: boolean, payloadHook?: PayloadHookFunc<KeyboardKey>) {
    super(new JQW('<div class="keyboard"></div>'));

    this.keyboardID = Keyboard.assignNextID();

    let size = KeyboardUtils.keyboardTypeToSize(type);
    this.numRows = size.rows;
    this.numCols = size.cols;

    if (type !== KeyBoardType.STANDARD) {
      this.modifierActive = false;
    }

    this.rows = [];
    // push row elements and new keyboard key elements to each row
    for (let r = 0; r < this.numRows; r++) {
      this.rows.push([]);
      let nextRow = new JQW(`<div class="row" id="row_${r}"></div>`);
      this.asElement().append(nextRow);
      for (let c = 0; c < this.numCols; c++) {
        let newKey = new KeyboardKey(KeyboardUtils.keyboardSymbols[r % 4][c], allowTransition, this, r, c, payloadHook);
        this.rows[r].push(newKey);
        nextRow.append(newKey.asElement());

        if (r < 4) {
          newKey.asElement().addClass('bolder');
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

  public setSoundPackSwitcher(type: SoundPackSwitcherType) {
    if (this.soundPackSwitcher !== undefined) {
      this.soundPackSwitcher.asElement().remove();
    }
    this.soundPackSwitcher = new SoundPackSwitcher(type);

    this.asElement().append(this.soundPackSwitcher.asElement());
  }

  public getNumRows(): number {
    return this.numRows;
  }

  public getNumCols(): number {
    return this.numCols;
  }

  /**
   * @return this keyboard's id
   */
  public getID(): number {
    return this.keyboardID;
  }

  /**
   * @return the keyboard key at the given row and column
   */
  public getKey(r: number, c: number): KeyboardKey {
    return this.rows[r][c];
  }

  /**
   * set a click listener for all of the keys
   */
  public setClickKeyListener(callback: (key: KeyboardKey) => void) {
    for (let r = 0; r < this.numRows; r++) {
      for (let c = 0; c < this.numCols; c++) {
        let key = this.rows[r][c];
        key.asElement().click(() => {
          callback(key);
        });
        key.asElement().css('cursor', 'pointer');
      }
    }
  }

  public getColorManager(): ColorManager {
    return this.colorManager;
  }

  /**
   * set the visibility to the key text to the given value
   * @param value the visibility value
   */
  public setShowKeys(value: boolean) {
    this.showKeys = value;
    this.setVisible();
  }

  /** reset all keys to their default colors */
  public resetKeys() {
    for (let r = 0; r < this.numRows; r++) {
      for (let c = 0; c < this.numCols; c++) {
        this.rows[r][c].setDefaultColor();
      }
    }
  }

  /** unhighlight all keys */
  public removeHighlight() {
    for (let r = 0; r < this.numRows; r++) {
      for (let c = 0; c < this.numCols; c++) {
        this.rows[r][c].removeHighlight();
      }
    }
  }

  /**
   * set the visibility of the key symbols based on the showKey flag
   */
  private setVisible() {
    let cssObj = {'color': this.showKeys ? '' : 'rgba(0,0,0,0)'};
    for (let r = 0; r < this.numRows; r++) {
      for (let c = 0; c < this.numCols; c++) {
        this.rows[r][c].setCSS(cssObj);
      }
    }
  }

  /**
   * resize the keyboard keys based on the scale. 1 is a 60 x 60 key
   */
  public resize(scale = 1) {
    let css = KeyboardKey.getScaleCSS(scale);

    for (let r = 0; r < this.numRows; r++) {
      for (let c = 0; c < this.numCols; c++) {
        this.rows[r][c].setCSS(css);
      }
    }

    if (this.soundPackSwitcher !== undefined) {
      this.soundPackSwitcher.setScale(scale);
    }
  }

  /**
   * apply the vertical-align class to center this keyboard vertiacally
   */
  public centerVertical() {
    this.asElement().addClass('vertical-align');
  }

  /**
   * called when a key is pressed. performs logic to determine which key in the song to press
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
        this.pressed[key] = true;
      } else if (this.soundPackSwitcher !== undefined) {
        this.soundPackSwitcher.keyPressed(key);
      }
    }
  }

  /**
   *
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

  /**
   * where a key officially gets pressed
   */
  private pressedKey(r: number, c: number) {
    this.colorManager.pressedKey(r, c);

    SongManager.getInstance().pressedKey(KeyboardUtils.gridToLinear(r, c, this.numCols));
  }

  /**
   * where a key officially gets pressed
   */
  private releasedKey(r: number, c: number) {
    this.colorManager.releasedKey(r, c);

    SongManager.getInstance().releasedKey(KeyboardUtils.gridToLinear(r, c, this.numCols));
  }

  /**
   * bold or unbold keys based on the modifier active flag
   */
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
