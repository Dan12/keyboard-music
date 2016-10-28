/**
 * a selective key and mouse event propegator
 */
class InputEventPropegator {
  private mode: Mode;
  private keyboard: Keyboard;

  constructor(keyboard: Keyboard) {
    this.mode = Mode.KEYBOARD;
    this.keyboard = keyboard;

    this.initKeyMaps();

    this.initMouseMaps();
  }

  /**
   * initialize the key event listeners and mode callback events
   * @method initKeyMaps
   */
  private initKeyMaps() {
    $('body').keydown((event: JQueryKeyEventObject) => {
      switch (this.mode) {
        case Mode.KEYBOARD:
          this.keyboard.keyDown(event.keyCode);
          break;
      }
    });

    $('body').keydown((event: JQueryKeyEventObject) => {
      switch (this.mode) {
        case Mode.KEYBOARD:
          this.keyboard.keyUp(event.keyCode);
          break;
      }
    });
  }

  /**
   * initialize the key event listeners and mode callback events
   * @method initKeyMaps
   */
  private initMouseMaps() {
    $('body').mousedown((event: JQueryMouseEventObject) => {
      console.log(event);
    });
  }
}

/**
 * an enum for the modes of the application. TODO: switch to other file
 * @class Mode
 * @static
 */
const enum Mode {
  KEYBOARD,
  EDITOR
}
