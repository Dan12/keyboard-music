/// <reference path="./soundPackEnum.ts"/>

class PadMessage {

  public readonly dirn: KeyDirection;
  public readonly row: number;
  public readonly col: number;
  public readonly pack: number;

  constructor(dirn: KeyDirection, pack: number, row: number, col: number) {
    this.dirn = dirn;

    this.row = row;
    this.col = col;
    this.pack = pack;
  }
}