/**
 * a class that can recieve a payload
 */
abstract class PayloadReceiver<T> extends DomElement {
  private previousColor: string;

  /** the paylod hook function to externally define the payload data and behavior */
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

  /**
   * set the previous color to this element's current color
   */
  public setPreviousColor() {
    this.previousColor = this.asElement().css('background-color');
  }

  /**
   * Returns true if this receiver can receive the given payload.
   * This check is performed through the payload hook using the CAN_RECEIVE request type.
   */
  private canReceive(payload: Payload): boolean {
    return this.payloadHook !== undefined && this.payloadHook(PayloadHookRequest.CAN_RECEIVE, payload);
  }

  /**
   * Handle the payload that was received.
   * It will be a payload that can be received as defined by canReceive.
   */
  private receivePayload(payload: Payload): void {
    if (this.payloadHook !== undefined) {
      this.payloadHook(PayloadHookRequest.RECEIVED, payload, this.getObjectData());
    }
  }

  /**
   * @returns this receiver's object data, as defined by the generic type
   */
  abstract getObjectData(): T;
}
