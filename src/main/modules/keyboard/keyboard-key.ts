/// <reference path="../song/sound-container.ts"/>

/**
 * A single key on a keyboard.
 */
class KeyboardKey extends HybridPayload<KeyboardKey> {
  private row: number;
  private col: number;
  private keyboard: Keyboard;
  private defaultColor: string;

  constructor(symbol: string, transition: boolean, k: Keyboard, r: number, c: number, hook?: PayloadHookFunc<KeyboardKey>) {
    super(new JQW(`<div class="keyboard_key ${(transition ? 'transition' : '')}">${symbol}</div>`), hook);

    this.keyboard = k;
    this.row = r;
    this.col = c;
    this.defaultColor = 'white';
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

  public setDefaultColor(r: number, g: number, b: number) {
    this.defaultColor = `rgb(${r}, ${g}, ${b})`;
    this.resetColor();
  }

  /**
   * remove coloring css
   */
  public resetColor() {
    this.asElement().css('background-color', this.defaultColor);
  }

  public setCSS(css: {}) {
    this.asElement().css(css);
  }

  /**
   * set the color of this element with rgb value from 0 to 255
   */
  public setColor(r: number, g: number, b: number) {
    this.asElement().css('background-color', `rgb(${r}, ${g}, ${b})`);
  }

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
