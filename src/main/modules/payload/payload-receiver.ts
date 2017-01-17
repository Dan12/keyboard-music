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

    DomEvents.addListener(this.asElement().getDomObj(), MousePayload.CHECK_EVENT, (event: CustomEvent) => {
      if (this.canReceive(event.detail.payload)) {
        this.receiveHighlight();
        MousePayload.addReceiver(this);
      }
    });

    DomEvents.addListener(this.asElement().getDomObj(), MousePayload.RECEIVE_EVENT, (event: CustomEvent) => {
      if (this.canReceive(event.detail.payload)) {
        this.receivePayload(event.detail.payload);
      }
    });
  }

  public receiveHighlight() {
    this.asElement().css({'background-color': 'rgb(150,230,230)'});
  }

  public removeReceiveHighlight() {
    this.asElement().css({'background-color': ''});
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
