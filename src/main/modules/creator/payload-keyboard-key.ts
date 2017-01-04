class PayloadKeyboardKey extends PayloadReceiver {

  private payloadHook: (payload: Payload, r: number, c: number) => void;
  private row: number;
  private col: number;

  private key: KeyboardKey;

  constructor(symbol: string, r: number, c: number, hook: (payload: Payload, r: number, c: number) => void) {
    super($(`<div></div>`));

    this.row = r;
    this.col = c;

    this.payloadHook = hook;

    this.key = new KeyboardKey(symbol);

    this.asElement().append(this.key.asElement());
  }

  public getKey(): KeyboardKey {
    return this.key;
  }

  public canReceive(payload: Payload): boolean {
    return payload instanceof SoundFile;
  }

  public receivePayload(payload: Payload) {
    this.payloadHook(payload, this.row, this.col);
  }
}
