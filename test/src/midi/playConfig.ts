/// <reference path="./sound.ts"/>

class PlayConfiguration {

  private config: PadConfiguration[][][];

  constructor(c: PadConfiguration[][][]) {
    this.config = c;
  }

  public getPadConfig(p: number, r: number, c: number): PadConfiguration {
    if (this.verifyPRC(p, r, c)) {
      return this.config[p][r][c];
    } else {
      return PadConfiguration.NoConfig;
    }
  }

  private verifyPRC(p: number, r: number, c: number): boolean {
    return p >= 0 && r >= 0 && c >= 0 &&
      p < this.config.length && r < this.config[p].length && c < this.config[p][r].length &&
      this.config[p][r][c] !== undefined;
  }
}

class PadConfiguration {
  public static NoConfig = new PadConfiguration(false, false, 0, []);

  // do you have to hold down to play the pad
  public readonly holdToPlay: boolean;

  // toggle on and off (usually used if loop is on)
  public readonly toggle: boolean;

  public readonly quantization: number;

  public readonly groups: Sound[];

  constructor(htp: boolean, tggle: boolean, quant: number, grps: Sound[]) {
    this.holdToPlay = htp;
    this.toggle = tggle;
    this.quantization = quant;
    this.groups = grps;
  }
}