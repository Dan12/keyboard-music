class PayloadKeyboard extends PayloadReceiver<number> {

  private addKeyCallback: (r: number, c: number, payload: Payload) => void;

  private keyboard: Keyboard;

  constructor(type: KeyBoardType, hook: PayloadHookFunc<number>, keyHook: PayloadHookFunc<KeyboardKey>) {
    super(new JQueryWrapper('<div class="horizontal-column"></div>'), hook);

    this.keyboard = new Keyboard(type, false, keyHook);

    this.asElement().append(this.keyboard.asElement());
  }

  public getKeyboard(): Keyboard {
    return this.keyboard;
  }

  public getObjectData(): number {
    return 0;
  }
}
