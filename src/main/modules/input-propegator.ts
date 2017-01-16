/**
 * a selective key and mouse event propegator
 */
class InputEventPropegator {
  private static pulledFocus: boolean;

  /**
   * initialize the propegtor
   */
  public static init() {
    InputEventPropegator.initKeyMaps();

    InputEventPropegator.pulledFocus = false;
  }

  public static pullFocus() {
    InputEventPropegator.pulledFocus = true;
  }

  public static blur() {
    InputEventPropegator.pulledFocus = false;
  }

  private static allowInput(event: JQueryKeyEventObject): boolean {
    return !event.metaKey && !event.ctrlKey && !InputEventPropegator.pulledFocus;
  }

  // TODO
  public static switchedSoundPack() {
    switch (ModeHandler.getMode()) {
      case Mode.KEYBOARD:

        break;
      case Mode.CREATOR:
        Creator.getInstance().updateMapToGUI(false);
        Toolbar.getInstance().switchedSoundPack();
        break;
    }
  }

  /**
   * initialize the key event listeners and mode callback events
   */
  private static initKeyMaps() {
    (new JQW('body')).keydown((event: JQueryKeyEventObject) => {
      if (InputEventPropegator.allowInput(event)) {
        switch (ModeHandler.getMode()) {
          case Mode.KEYBOARD:
            KeyboardLayout.getInstance().getKeyboard().keyDown(event.keyCode);
            return false;
          case Mode.CREATOR:
            Creator.getInstance().keyDown(event.keyCode);

            return false;
        }
      } else if (InputEventPropegator.pulledFocus) {
        Toolbar.getInstance().focusedKeyPress(event.keyCode);
      }
    });

    (new JQW('body')).keyup((event: JQueryKeyEventObject) => {
      if (InputEventPropegator.allowInput(event)) {
        switch (ModeHandler.getMode()) {
          case Mode.KEYBOARD:
            KeyboardLayout.getInstance().getKeyboard().keyUp(event.keyCode);
            return false;
          case Mode.CREATOR:
            Creator.getInstance().keyUp(event.keyCode);
            return false;
        }
      }
    });
  }
}
