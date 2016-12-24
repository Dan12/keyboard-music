// TODO add customization
class ColorManager {
  private keys: KeyboardKey[][];

  constructor(keys: KeyboardKey[][]) {
    this.keys = keys;
  }

  public pressedKey(r: number, c: number) {
    this.keys[r][c].setColor(255, 160, 0);
  }

  public releasedKey(r: number, c: number) {
    this.keys[r][c].resetColor();
  }
}
