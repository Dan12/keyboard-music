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
          Keyboard.getInstance().keyDown(event.keyCode);
          break;
      }

      // TODO check mode
      if (event.keyCode === 32) {
        FileInspector.getInstance().pressSpace();
        return false;
      }
    });

    $('body').keyup((event: JQueryKeyEventObject) => {
      switch (ModeHandler.getMode()) {
        case Mode.KEYBOARD:
          Keyboard.getInstance().keyUp(event.keyCode);
          break;
      }
    });
  }

  /**
   * initialize the key event listeners and mode callback events
   * TODO consider removing
   * @method initKeyMaps
   */
  private static initMouseMaps() {
    $('body').mousedown((event: JQueryMouseEventObject) => {
      console.log(event);
    });
  }
}
