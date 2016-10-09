import { Element } from '../interfaces/element';
import { KeyboardKey } from './keyboard-key';

/**
 * The keyboard module to represent an html keyboard.
 *
 * @class Keyboard
 * @constructor
 */
export class Keyboard extends Element {

  private rows: KeyboardKey[][];
  private numRows = 4;
  private numCols = 12;

  constructor() {
    super($('<div id="keyboard"></div>'));
    this.rows = [];
    for (let r = 0; r < this.numRows; r++) {
      this.rows.push([]);
      let nextRow = $(`<div class="row" id="row_${r}"></div>`);
      this.asElement().append(nextRow);
      for (let c = 0; c < this.numCols; c++) {
        let nextCell = new KeyboardKey();
        this.rows[r].push(nextCell);
        nextRow.append(this.rows[r][c].asElement());
      }
    }
  }
}
