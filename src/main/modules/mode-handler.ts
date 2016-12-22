/**
 * a class to handle the different modes of the editor
 * @class ModeHandler
 * @static
 */
class ModeHandler {
  private static mode: Mode;

  static init(defaultMode?: Mode) {
    if (defaultMode) {
      ModeHandler.mode = defaultMode;
    } else {
      ModeHandler.mode = Mode.KEYBOARD;
    }

    Creator.getInstance().asElement().hide();
  }

  public static getMode(): Mode {
    return ModeHandler.mode;
  }

  public static setMode(mode: Mode) {
    if (mode !== ModeHandler.mode) {
      switch (ModeHandler.mode) {
        case Mode.KEYBOARD:
          Keyboard.getInstance().asElement().hide(1000);
          break;
        case Mode.CREATOR:
          Creator.getInstance().asElement().hide(1000);
          break;
      }

      switch (mode) {
        case Mode.KEYBOARD:
          Keyboard.getInstance().asElement().show(1000);
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
 * @class Mode
 * @static
 */
const enum Mode {
  KEYBOARD,
  EDITOR,
  CREATOR
}
