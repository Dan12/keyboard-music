/// <reference path="../../interfaces/element.ts"/>
/// <reference path="../song/sound-container.ts"/>

/**
 * A single key on a keyboard.
 *
 * @class KeyboardKey
 * @constructor
 */
class KeyboardKey extends HybridPayload<KeyboardKey> {
  private row: number;
  private col: number;
  private keyboard: Keyboard;

  constructor(symbol: string, transition: boolean, k: Keyboard, r: number, c: number, hook?: PayloadHookFunc<KeyboardKey>) {
    super($(`<div class="keyboard_key primary_color ${(transition ? 'transition' : '')}">${symbol}</div>`), hook);

    this.keyboard = k;
    this.row = r;
    this.col = c;
  }

  /**
   * get a css object that scales the key
   * @method getScaleCSS
   * @return {JSON} a json object
   */
  public static getScaleCSS(scale = 1): {} {
    // 60 x 60 px key
    let ret = {};
    ret['font-size'] = `${35 * scale}px`;
    ret['padding'] = `${9 * scale}px ${2 * scale}px`;
    ret['width'] = `${54 * scale}px`;
    ret['height'] = `${40 * scale}px`;
    ret['border-radius'] = `${6 * scale}px`;
    return ret;
  }

  /**
   * remove coloring css
   * @method resetColor
   */
  public resetColor() {
    this.asElement().css('background-color', '');
  }

  public setCSS(css: {}) {
    this.asElement().css(css);
  }

  /**
   * set the color of this element
   * @method setColor
   * @param {number} r the red value from 0-255
   * @param {number} g the greed value from 0-255
   * @param {number} b the blue value from 0-255
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
