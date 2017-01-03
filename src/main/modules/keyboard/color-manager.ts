// TODO add customization
class ColorManager {
  private keys: KeyboardKey[][];

  // a function that takes a row, column, and a pressed flag as an input
  // and outputs a set of actions
  private routine: (r: number, c: number, p: boolean) => RoutineResult[];

  constructor(keys: KeyboardKey[][]) {
    this.keys = keys;

    this.routine = (r: number, c: number, p: boolean) => {
      return [{row: r, col: c, r: p ? 255 : -1, g: p ? 160 : -1, b: p ? 0 : -1}];
    };
  }

  public setRoutine(routine: (r: number, c: number, p: boolean) => RoutineResult[]) {
    this.routine = routine;
  }

  public pressedKey(r: number, c: number) {
    this.runRoutine(r, c, true);
  }

  public releasedKey(r: number, c: number) {
    this.runRoutine(r, c, false);
  }

  private runRoutine(r: number, c: number, p: boolean) {
    let results = this.routine(r, c, p);
    for (let i = 0; i < results.length; i++) {
      let result = results[i];
      if (result.r < 0 || result.g < 0 || result.b < 0) {
        this.keys[result.row][result.col].resetColor();
      } else {
        this.keys[result.row][result.col].setColor(result.r, result.b, result.g);
      }
    }
  }
}

/**
 * @class RoutineResult
 */
interface RoutineResult {
  row: number;
  col: number;
  r: number;
  g: number;
  b: number;
}
