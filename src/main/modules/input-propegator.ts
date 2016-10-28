/**
 * a selective key event propegator
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

  private initMouseMaps() {
    $('body').mousedown((event: JQueryMouseEventObject) => {
      console.log(event);
    });
  }
}

const enum Mode {
  KEYBOARD,
  EDITOR
}
