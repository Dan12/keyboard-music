/**
 * a wrapper for the keyboard class that is a payload receiver
 */
class PayloadKeyboard extends PayloadReceiver<number> {

  private keyboard: Keyboard;

  constructor(type: KeyBoardType, hook: PayloadHookFunc<number>, keyHook: PayloadHookFunc<KeyboardKey>) {
    super(new JQW('<div style="display: inline-block;"></div>'), hook);

    // false because the payload needs 0 transition time for background color
    this.keyboard = new Keyboard(type, false, keyHook);

    this.asElement().append(this.keyboard.asElement());
  }

  /**
   * vertical center this keyboard
   */
  public centerVertical() {
    this.asElement().addClass('vertical-align');
  }

  public getKeyboard(): Keyboard {
    return this.keyboard;
  }

  /**
   * use the keyboard id to identify this object receiver
   * just because the payload receiver sometimes needs a way to identify the receiving object
   * @return the keyboard id
   */
  public getObjectData(): number {
    return this.keyboard.getID();
  }
}
