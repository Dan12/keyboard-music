/// <reference path="../song/sound-container.ts"/>

/**
 * A single key on a keyboard.
 */
class KeyboardKey extends HybridPayload<KeyboardKey> {
  private row: number;
  private col: number;
  private keyboard: Keyboard;
  private defaultColor: string;
  private isHighlighted: boolean;

  // the highlighed color for a keyboard key
  private static HIGHLIGH_COLOR = 'rgb(255,255,100)';

  // the default background color for a keyboard key
  private static DEFAULT_COLOR = 'white';

  constructor(symbol: string, transition: boolean, k: Keyboard, r: number, c: number, hook?: PayloadHookFunc<KeyboardKey>) {
    super(new JQW(`<div class="keyboard_key ${(transition ? 'transition' : '')}">${symbol}</div>`), hook);

    this.keyboard = k;
    this.row = r;
    this.col = c;
    this.defaultColor = KeyboardKey.DEFAULT_COLOR;
    this.isHighlighted = false;
    this.resetColor();
  }

  /**
   * @return a css object that scales the key
   */
  public static getScaleCSS(scale = 1): {} {
    // scale = 1 is a 60 x 60 px key
    let ret = {};
    ret['font-size'] = `${35 * scale}px`;
    ret['padding'] = `${9 * scale}px ${2 * scale}px`;
    ret['width'] = `${54 * scale}px`;
    ret['height'] = `${40 * scale}px`;
    ret['border-radius'] = `${6 * scale}px`;
    return ret;
  }

  /**
   * set the default background color for this key.
   * If no values are supplied, set the default background color to a keyboard key's default color
   */
  public setDefaultColor(r?: number, g?: number, b?: number) {
    if (r !== undefined && g !== undefined && b !== undefined) {
      this.defaultColor = `rgb(${r}, ${g}, ${b})`;
    } else {
      this.defaultColor = KeyboardKey.DEFAULT_COLOR;
    }
    this.resetColor();
  }

  /**
   * highlight this key
   */
  public highlight() {
    this.isHighlighted = true;
    this.resetColor();
  }

  /**
   * unhighlight this key
   */
  public removeHighlight() {
    this.isHighlighted = false;
    this.resetColor();
  }

  public removeReceiveHighlight() {
    this.resetColor();
  }

  /**
   * reset background color to the default of highlighted color
   */
  public resetColor() {
    this.asElement().css('background-color', this.isHighlighted ? KeyboardKey.HIGHLIGH_COLOR : this.defaultColor);
  }

  /**
   * set this key's css to the given values
   */
  public setCSS(css: {}) {
    this.asElement().css(css);
  }

  /**
   * set the color of this element with rgb value from 0 to 255
   */
  public setColor(r: number, g: number, b: number) {
    this.asElement().css('background-color', `rgb(${r}, ${g}, ${b})`);
  }

  /**
   * required by the payload receiver class, return this so that the hook can know which key was receiving
   */
  public getObjectData(): KeyboardKey {
    return this;
  }

  public getRow(): number {
    return this.row;
  }

  public getCol(): number {
    return this.col;
  }

  public getKeyboard(): Keyboard {
    return this.keyboard;
  }
}
