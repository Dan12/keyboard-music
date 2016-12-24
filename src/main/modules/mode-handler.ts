/**
 * a class to handle the different modes of the editor
 * @class ModeHandler
 * @static
 */
class ModeHandler {
  private static mode: Mode;

  /**
   * Initialize the mode handler
   * @method init
   * @param {Mode} [defaultMode] the initial mode
   * @static
   */
  static init(defaultMode?: Mode) {
    ModeHandler.mode = defaultMode;

    Creator.getInstance().asElement().hide();
    KeyboardLayout.getInstance().asElement().hide();
  }

 /**
  * @method getMode
  * @static
  * @return {Mode} the current mode
  */
  public static getMode(): Mode {
    return ModeHandler.mode;
  }

  /**
   * set the mode and display the correct modules
   * @method setMode
   * @param {Mode} mode the mode to set the app to
   */
  public static setMode(mode: Mode) {
    if (mode !== ModeHandler.mode) {
      if (ModeHandler.mode !== undefined) {
        switch (ModeHandler.mode) {
          case Mode.KEYBOARD:
            KeyboardLayout.getInstance().asElement().hide(1000);
            break;
          case Mode.CREATOR:
            Creator.getInstance().asElement().hide(1000);
            break;
        }
      }

      switch (mode) {
        case Mode.KEYBOARD:
          KeyboardLayout.getInstance().asElement().show(1000);
          break;
        case Mode.CREATOR:
          Creator.getInstance().asElement().show(1000);
          break;
      }

      ModeHandler.mode = mode;
    }
  }
}

/**
 * An enum to represent the current application mode
 * @class Mode
 * @static
 */
const enum Mode {
  KEYBOARD,
  EDITOR,
  CREATOR
}
