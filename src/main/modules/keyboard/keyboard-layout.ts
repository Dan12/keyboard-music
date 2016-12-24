/// <reference path="keyboard.ts"/>

class KeyboardLayout extends JQElement {

  private static instance: KeyboardLayout;

  private keyboard: Keyboard;

  public static getInstance(): KeyboardLayout {
    if (KeyboardLayout.instance === undefined) {
      KeyboardLayout.instance = new KeyboardLayout();
    }

    return KeyboardLayout.instance;
  }

  constructor() {
    super($('<div id="keyboard"></div>'));

    this.keyboard = new Keyboard(KeyBoardType.SQUARE);
    this.keyboard.centerVertical();

    this.asElement().append(this.keyboard.asElement());
  }

  /**
   * @method getKeyboard
   */
  public getKeyboard(): Keyboard {
    return this.keyboard;
  }
}
