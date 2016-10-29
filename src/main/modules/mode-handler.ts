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

    ModeHandler.creator.asElement().hide();
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

  public static setMode(mode: Mode) {
    if (mode !== ModeHandler.mode) {
      switch (ModeHandler.mode) {
        case Mode.KEYBOARD:
          ModeHandler.keyboard.asElement().hide(1000);
          break;
        case Mode.CREATOR:
          ModeHandler.creator.asElement().hide(1000);
          break;
      }

      switch (mode) {
        case Mode.KEYBOARD:
          ModeHandler.keyboard.asElement().show(1000);
          break;
        case Mode.CREATOR:
          ModeHandler.creator.asElement().show(1000);
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
