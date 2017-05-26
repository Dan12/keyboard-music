/**
 * a class to handle the different modes of the editor
 */
class ModeHandler {
  private static mode: Mode;

  /**
   * Initialize the mode handler
   */
  static init() {
    Creator.getInstance().asElement().hide();
    KeyboardLayout.getInstance().asElement().hide();
    Splitter.getInstance().asElement().hide();
    Editor.getInstance().asElement().hide();
  }

 /**
  * @return the current mode
  */
  public static getMode(): Mode {
    return ModeHandler.mode;
  }

  /**
   * set the mode and display the correct modules
   * @param mode the mode to set the app to
   */
  public static setMode(mode: Mode) {
    if (mode !== ModeHandler.mode) {
      if (ModeHandler.mode !== undefined) {
        switch (ModeHandler.mode) {
          case Mode.KEYBOARD:
            KeyboardLayout.getInstance().asElement().hide();
            break;
          case Mode.CREATOR:
            Creator.getInstance().asElement().hide();
            break;
          case Mode.SPLITTER:
            Splitter.getInstance().asElement().hide();
            break;
          case Mode.EDITOR:
            Editor.getInstance().asElement().hide();
            break;
        }
      }

      switch (mode) {
        case Mode.KEYBOARD:
          KeyboardLayout.getInstance().asElement().show();
          break;
        case Mode.CREATOR:
          Creator.getInstance().asElement().show();
          break;
        case Mode.SPLITTER:
          Splitter.getInstance().asElement().show();
          break;
        case Mode.EDITOR:
            Editor.getInstance().asElement().show();
            break;
      }

      ModeHandler.mode = mode;
    }
  }
}

/**
 * An enum to represent the current application mode
 */
const enum Mode {
  KEYBOARD,
  EDITOR,
  CREATOR,
  SPLITTER
}
