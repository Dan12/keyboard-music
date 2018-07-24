/// <reference path="./keyDirectionEnum.ts"/>

/**
 * Encapsulate a keycode
 */
class KeyboardMessage {

  public readonly keyCode: number;
  public readonly direction: KeyDirection;
  public readonly event: KeyboardEvent;

  constructor(kc: number, dir: KeyDirection, event: KeyboardEvent) {
    this.keyCode = kc;
    this.direction = dir;
    this.event = event;
  }
}