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

  constructor() {
    super($('<div class="keyboard_key primary_color"></div>'));
  }
}
