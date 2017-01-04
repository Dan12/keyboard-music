/// <reference path="./sound-container.ts"/>

class SoundPack {
  private sounds: SoundContainer[][];
  private rows: number;
  private cols: number;

  constructor(type: string) {
    let size = KeyboardUtils.getKeyboardSizeString(type);
    this.rows = size.rows;
    this.cols = size.cols;

    this.sounds = [];
    for (let i = 0; i < this.rows; i++) {
      this.sounds.push([]);
      for (let j = 0; j < this.cols; j++) {
        this.sounds[i].push(null);
      }
    }
  }

  public addContainer(container: SoundContainer, loc: number) {
    let location = this.linearToGrid(loc);
    let row = location[0];
    let col = location[1];
    if (row < 0 || row >= this.rows || col < 0 || col >= this.cols) {
      console.log(`Invalid soundpack index at ${row},${col}`);
      return;
    }
    this.sounds[row][col] = container;
  }

  // returns in [row, col] order
  private linearToGrid(i: number): number[] {
    return [Math.floor(i / this.cols), i % this.cols];
  }

  private gridToLinear(r: number, c: number): number {
    return r * this.cols + c;
  }
}
