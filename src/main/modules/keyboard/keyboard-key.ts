/// <reference path="../../interfaces/element.ts"/>
/// <reference path="../song/sound-container.ts"/>

/**
 * A single key on a keyboard.
 *
 * @class KeyboardKey
 * @constructor
 */
class KeyboardKey extends JQElement {

  constructor(symbol: string) {
    super($(`<div class="keyboard_key primary_color">${symbol}</div>`));
  }

  /**
   * remove all stylizing
   * @method resetColor
   */
  public resetColor() {
    this.asElement().removeAttr('style');
  }

  /**
   * set the color of this element
   * @method setColor
   * @param {number} r the red value from 0-255
   * @param {number} g the greed value from 0-255
   * @param {number} b the blue value from 0-255
   * @param {number} [a] the optional alpha value from 0-255
   */
  public setColor(r: number, g: number, b: number, a?: number) {
    this.asElement().css('background-color', `rgb(${r}, ${g}, ${b})`);
  }

}
