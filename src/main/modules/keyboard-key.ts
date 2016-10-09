import { SoundContainer } from './sound-container';
import { Element } from '../interfaces/element';

/**
 * A single key on a keyboard.
 *
 * @class KeyboardKey
 * @constructor
 */
export class KeyboardKey extends Element {

  private sound: SoundContainer;

  constructor(symbol: string) {
    super($(`<div class="keyboard_key primary_color"><div class="key_text">${symbol}</div></div>`));
  }
}
