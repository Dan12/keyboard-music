/// <reference path="../keyboard/keyboard.ts"/>

/**
 * the layout class for the keyboard mode
 */
class KeyboardLayout extends DomElement {

  private static instance: KeyboardLayout;

  private keyboard: Keyboard;

  /**
   * @return the singleton instance of this class
   */
  public static getInstance(): KeyboardLayout {
    if (KeyboardLayout.instance === undefined) {
      KeyboardLayout.instance = new KeyboardLayout();
    }

    return KeyboardLayout.instance;
  }

  constructor() {
    super(new JQW('<div id="keyboard"></div>'));

    this.keyboard = new Keyboard(KeyBoardType.STANDARD, true);
    this.keyboard.centerVertical();

    this.asElement().append(this.keyboard.asElement());

    this.init();
  }

  public init() {
    SongManager.getInstance().loadSong('songs/eq.min.json', () => {
      this.keyboard.setSoundPackSwitcher(SoundPackSwitcherType.ARROWS);
    });
  }

  public getKeyboard(): Keyboard {
    return this.keyboard;
  }
}
