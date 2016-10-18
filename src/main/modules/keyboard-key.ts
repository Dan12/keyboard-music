/// <reference path="../interfaces/element.ts"/>
/// <reference path="./sound-container.ts"/>

/**
 * A single key on a keyboard.
 *
 * @class KeyboardKey
 * @constructor
 */
class KeyboardKey extends JQElement {

  private sound: SoundContainer;

  constructor(symbol: string) {
    super($(`<div class="keyboard_key primary_color"><div class="key_text">${symbol}</div></div>`));
  }
}
