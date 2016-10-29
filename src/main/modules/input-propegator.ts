/**
 * a selective key and mouse event propegator
 */
class InputEventPropegator {
  public static init() {
    InputEventPropegator.initKeyMaps();

    InputEventPropegator.initMouseMaps();
  }

  /**
   * initialize the key event listeners and mode callback events
   * @method initKeyMaps
   */
  private static initKeyMaps() {
    $('body').keydown((event: JQueryKeyEventObject) => {
      switch (ModeHandler.getMode()) {
        case Mode.KEYBOARD:
          ModeHandler.getKeyboard().keyDown(event.keyCode);
          break;
      }
    });

    $('body').keydown((event: JQueryKeyEventObject) => {
      switch (ModeHandler.getMode()) {
        case Mode.KEYBOARD:
          ModeHandler.getKeyboard().keyUp(event.keyCode);
          break;
      }
    });
  }

  /**
   * initialize the key event listeners and mode callback events
   * @method initKeyMaps
   */
  private static initMouseMaps() {
    $('body').mousedown((event: JQueryMouseEventObject) => {
      console.log(event);
    });
  }
}
