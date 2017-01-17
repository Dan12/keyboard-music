/**
 * an object that is a payload as well as a payload receiver.
 */
abstract class HybridPayload<T> extends PayloadReceiver<T> implements Payload {
  constructor(element: JQW, hook: PayloadHookFunc<T>) {
    super(element, hook);

    this.asElement().mousedown((e: JQueryMouseEventObject) => {
      if (this.canBePayload())
        this.setPayload(this, e.pageX, e.pageY);
    });
  }

  public setPayload(payload: Payload, mx: number, my: number) {
    MousePayload.setPayload(payload, mx, my);
  }

  public highlight() {
    this.asElement().css({'background-color': 'white'});
  }

  public removeHighlight() {
    this.asElement().css({'background-color': ''});
  }

  /** call the payload hook function to determine if this object can be a payload */
  private canBePayload(): boolean {
    return this.payloadHook !== undefined && this.payloadHook(PayloadHookRequest.IS_PAYLOAD, undefined, this.getObjectData());
  }
}
