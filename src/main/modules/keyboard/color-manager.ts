// TODO add customization
/**
 * A color manager class for a keyboard. Able to abstract color routines for a keyboard press.
 */
class ColorManager {
  private keys: KeyboardKey[][];

  /**
   * a function that takes a row, column, and a pressed flag as an input
   * and outputs a set of actions. A -1 in an rgb result automatically resets the key
   */
  private routine: (r: number, c: number, p: boolean) => RoutineResult[];

  constructor(keys: KeyboardKey[][]) {
    this.keys = keys;

    this.routine = ColorManager.standardColorRoutine(255, 160, 0);
  }

  /**
   * set this color manager's routine
   */
  public setRoutine(routine: (r: number, c: number, p: boolean) => RoutineResult[]) {
    this.routine = routine;
  }

  /**
   * called when the color manager is supposed to reflect that the given row and colum have been pressed
   */
  public pressedKey(r: number, c: number) {
    this.runRoutine(r, c, true);
  }

  /**
   * called when the color manager is supposed to reflect that the given row and colum have been released
   */
  public releasedKey(r: number, c: number) {
    this.runRoutine(r, c, false);
  }

  /**
   * run the routine for the key at the given row and column
   */
  private runRoutine(r: number, c: number, p: boolean) {
    let results = this.routine(r, c, p);
    for (let i = 0; i < results.length; i++) {
      let result = results[i];
      // if the results are not within a valid range, reset the colors
      if (result.r < 0 || result.r > 255 || result.g < 0 || result.g > 255 || result.b < 0 || result.b > 255) {
        this.keys[result.row][result.col].resetColor();
      } else {
        this.keys[result.row][result.col].setColor(result.r, result.g, result.b);
      }
    }
  }

  /**
   * the standard same key press color routine for the given rgb color
   */
  public static standardColorRoutine(red: number, green: number, blue: number): (r: number, c: number, p: boolean) => RoutineResult[] {
    return (r: number, c: number, p: boolean) => {
              return [{row: r, col: c, r: p ? red : -1, g: p ? green : -1, b: p ? blue : -1}];
           };
  }
}

/**
 * a structure for the result of the color routine
 */
interface RoutineResult {
  row: number;
  col: number;
  r: number;
  g: number;
  b: number;
}
