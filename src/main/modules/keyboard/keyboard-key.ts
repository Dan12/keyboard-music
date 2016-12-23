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

  // TODO add color code
}
