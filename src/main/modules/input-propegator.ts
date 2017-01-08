/**
 * a selective key and mouse event propegator
 * @class InputEventPropegator
 * @static
 */
class InputEventPropegator {
  /**
   * initialize the propegtor
   * @method init
   */
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

    $('body').keyup((event: JQueryKeyEventObject) => {
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

  /**
   * initialize the key event listeners and mode callback events
   * TODO consider removing
   * @method initKeyMaps
   */
  private static initMouseMaps() {
    $('body').mousedown((event: JQueryMouseEventObject) => {
      // console.log(event);
    });
  }
}
