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
        this.restorePreviousColor();
        this.receivePayload(MousePayload.popPayload());
      }
    });

    // highlight on mouseover
    this.asElement().mouseenter(() => {
      let payload = MousePayload.peekPayload();
      if (payload !== undefined && this.canReceive(payload)) {
        this.setPreviousColor();
        this.asElement().css('background-color', 'rgb(150,230,230)');
      }
    });

    this.asElement().mouseleave(() => {
      this.restorePreviousColor();
    });
  }

  /**
   * set the previous color to this element's current color
   */
  public setPreviousColor() {
    this.previousColor = this.asElement().css('background-color');
  }

  /** restore the previous background color of the receiving element */
  private restorePreviousColor() {
    if (this.previousColor !== '') {
      this.asElement().css('background-color', this.previousColor);
      this.previousColor = '';
    }
  }

  /**
   * Returns true if this receiver can receive the given payload.
   * This check is performed through the payload hook using the CAN_RECEIVE request type.
   */
  private canReceive(payload: Payload): boolean {
    return this.payloadHook !== undefined && this.payloadHook(PayloadHookRequest.CAN_RECEIVE, payload, this.getObjectData());
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
