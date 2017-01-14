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
      if (!event.metaKey && !event.ctrlKey) {
        switch (ModeHandler.getMode()) {
          case Mode.KEYBOARD:
            KeyboardLayout.getInstance().getKeyboard().keyDown(event.keyCode);
            return false;
          case Mode.CREATOR:
            Creator.getInstance().keyDown(event.keyCode);

            Toolbar.getInstance().keyPress(event.keyCode);

            return false;
        }
      }
    });

    (new JQW('body')).keyup((event: JQueryKeyEventObject) => {
      switch (ModeHandler.getMode()) {
        case Mode.KEYBOARD:
          KeyboardLayout.getInstance().getKeyboard().keyUp(event.keyCode);
          return false;
        case Mode.CREATOR:
          Creator.getInstance().keyUp(event.keyCode);
          return false;
      }
    });
  }
}
