/// <reference path="./keyDirectionEnum.ts"/>

/**
 * Encapsulate a keycode
 */
class KeyboardMessage {

  public readonly keyCode: number;
  public readonly direction: KeyDirection;

  constructor(kc: number, dir: KeyDirection) {
    this.keyCode = kc;
    this.direction = dir;
  }
}