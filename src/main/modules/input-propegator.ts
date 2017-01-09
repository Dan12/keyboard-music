/**
 * a selective key and mouse event propegator
 */
class InputEventPropegator {
  /**
   * initialize the propegtor
   */
  public static init() {
    InputEventPropegator.initKeyMaps();
  }

  /**
   * initialize the key event listeners and mode callback events
   */
  private static initKeyMaps() {
    (new JQW('body')).keydown((event: JQueryKeyEventObject) => {
      switch (ModeHandler.getMode()) {
        case Mode.KEYBOARD:
          KeyboardLayout.getInstance().getKeyboard().keyDown(event.keyCode);
          break;
        case Mode.CREATOR:
          Creator.getInstance().keyDown(event.keyCode);

          if (event.keyCode === 32) {
            Toolbar.getInstance().pressSpace();
            return false;
          }
          break;
      }
    });

    (new JQW('body')).keyup((event: JQueryKeyEventObject) => {
      switch (ModeHandler.getMode()) {
        case Mode.KEYBOARD:
          KeyboardLayout.getInstance().getKeyboard().keyUp(event.keyCode);
          break;
        case Mode.CREATOR:
          Creator.getInstance().keyUp(event.keyCode);
          break;
      }
    });
  }
}
