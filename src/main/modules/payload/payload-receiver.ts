/**
 * a class that can recieve a payload
 * @class PayloadReceiver
 */
abstract class PayloadReceiver<T> extends DomElement {
  private previousColor: string;
  protected payloadHook: PayloadHookFunc<T>;

  constructor(element: JQW, hook: PayloadHookFunc<T>) {
    super(element);

    this.payloadHook = hook;

    this.previousColor = '';

    this.asElement().mouseup(() => {
      let payload = MousePayload.peekPayload();
      // only consume the payload if you can recieve it
      if (payload !== undefined && this.canReceive(payload)) {
        this.receivePayload(MousePayload.popPayload());
        this.asElement().css('background-color', this.previousColor);
      }
    });

    // highlight on mouseover
    this.asElement().mouseenter(() => {
      this.setPreviousColor();
      let payload = MousePayload.peekPayload();
      if (payload !== undefined && this.canReceive(payload)) {
        this.asElement().css('background-color', 'rgb(150,230,230)');
      }
    });

    this.asElement().mouseleave(() => {
      this.asElement().css('background-color', this.previousColor);
    });
  }

  // set the previous color to this element's current color
  public setPreviousColor() {
    this.previousColor = this.asElement().css('background-color');
  }

  public canReceive(payload: Payload): boolean {
    return this.payloadHook !== undefined && this.payloadHook(PayloadHookRequest.CAN_RECEIVE, payload);
  }

  /**
   * handle the payload that was received.
   * It will be a payload that can be received as defined by canReceive.
   * @method receivePayload
   * @param {Payload} payload
   */
  public receivePayload(payload: Payload): void {
    if (this.payloadHook !== undefined) {
      this.payloadHook(PayloadHookRequest.RECEIVED, payload, this.getObjectData());
    }
  }

  abstract getObjectData(): T;
}
