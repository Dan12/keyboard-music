/// <reference path="../../interfaces/element.ts"/>
/// <reference path="../song/sound-container.ts"/>

/**
 * A single key on a keyboard.
 *
 * @class KeyboardKey
 * @constructor
 */
class KeyboardKey extends HybridPayload {

  private payloadHook: (payload: Payload, r: number, c: number) => void;
  private row: number;
  private col: number;
  private payload: Payload;

  constructor(symbol: string, r?: number, c?: number, hook?: (payload: Payload, r: number, c: number) => void) {
    super($(`<div class="keyboard_key primary_color">${symbol}</div>`));

    this.row = r;
    this.col = c;

    this.payloadHook = hook;
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

  public canReceive(payload: Payload): boolean {
    return this.payloadHook !== undefined && (payload instanceof SoundFile || payload instanceof KeyboardKey);
  }

  public receivePayload(payload: Payload) {
    if (payload !== this) {
      this.setPayload(payload);
      this.payloadHook(this.payload, this.row, this.col);
    }
  }

  public canBePayload(): boolean {
    return this.payload !== undefined;
  }

  public getPayload(): Payload {
    return this.payload;
  }

  public setPayload(payload: Payload) {
    this.payload = payload;
    if (this.payload instanceof KeyboardKey)
      this.payload = (<KeyboardKey> this.payload).payload;
    if (!(this.payload instanceof SoundFile))
      collectErrorMessage('invalid key payload', payload);
  }

}
