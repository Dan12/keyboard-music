/**
 * a class to handle the different modes of the editor
 * @static
 */
class ModeHandler {
  private static keyboard: Keyboard;
  private static creator: Creator;
  private static mode: Mode;

  static init(keyboard: Keyboard, creator: Creator) {
    ModeHandler.keyboard = keyboard;
    ModeHandler.creator = creator;
    ModeHandler.mode = Mode.KEYBOARD;
  }

  public static getKeyboard(): Keyboard {
    return ModeHandler.keyboard;
  }

  public static getCreator(): Creator {
    return ModeHandler.creator;
  }

  public static getMode(): Mode {
    return ModeHandler.mode;
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
