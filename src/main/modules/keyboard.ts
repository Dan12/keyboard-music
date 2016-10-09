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

  private keyboardSymbols = [
    ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '-',  '='],
    ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P', '[',  ']'],
    ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', ';', '\'', '⏎'],
    ['Z', 'X', 'C', 'V', 'B', 'N', 'M', ',', '.', '/', '⇧',  'NA'],
  ];

  constructor() {
    super($('<div id="keyboard"></div>'));
    this.rows = [];
    for (let r = 0; r < this.numRows; r++) {
      this.rows.push([]);
      let nextRow = $(`<div class="row" id="row_${r}"></div>`);
      this.asElement().append(nextRow);
      for (let c = 0; c < this.numCols; c++) {
        let nextCell = new KeyboardKey(this.keyboardSymbols[r][c]);
        this.rows[r].push(nextCell);
        nextRow.append(this.rows[r][c].asElement());
      }
    }
  }
}
