/// <reference path="./padMessage.ts"/>

class DefaultPadIO extends AbstractIO<KeyboardMessage, PadMessage> {

  private curPad = 0;

  private static padKeys = [
    [49, 50, 51, 52, 53, 54, 55, 56,  57,  48,  189, 187],
    [81, 87, 69, 82, 84, 89, 85, 73,  79,  80,  219, 221],
    [65, 83, 68, 70, 71, 72, 74, 75,  76,  186, 222, 13],
    [90, 88, 67, 86, 66, 78, 77, 188, 190, 191, 16,  -1]
  ];

  private static soundpackKeys = [37, 38, 40, 39];

  private static invalidTuple: [number, number] = [-1, -1];

  private searchKeys(keyCode: number): [number, number] {
    for (let r = 0; r < DefaultPadIO.padKeys.length; r++) {
      for (let c = 0; c < DefaultPadIO.padKeys[r].length; c++) {
        if (DefaultPadIO.padKeys[r][c] === keyCode) {
          return [r, c];
        }
      }
    }

    return DefaultPadIO.invalidTuple;
  }

  private isDown: boolean[][];

  constructor() {
    super();

    this.isDown = Globals.defaultArr([DefaultPadIO.padKeys.length, DefaultPadIO.padKeys[0].length], false);
  }

  public receiveMessage(msg: KeyboardMessage) {
    let soundpackKey = DefaultPadIO.soundpackKeys.indexOf(msg.keyCode);
    if (soundpackKey === -1) {
      let keyRC = this.searchKeys(msg.keyCode);
      if (keyRC !== DefaultPadIO.invalidTuple) {
        if (msg.direction === KeyDirection.DOWN) {
          if (this.isDown[keyRC[0]][keyRC[1]]) {
            return;
          }
          this.isDown[keyRC[0]][keyRC[1]] = true;
        } else if (msg.direction === KeyDirection.UP) {
          this.isDown[keyRC[0]][keyRC[1]] = false;
        }
        this.sendMessage(new PadMessage(msg.direction, this.curPad, keyRC[0], keyRC[1]));
      }
    } else {
      this.curPad = soundpackKey;
      if (msg.direction === KeyDirection.DOWN) {
        this.sendMessage(new PadMessage(msg.direction, this.curPad, -1, -1));
      }
    }
  }
}