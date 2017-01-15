/**
 * an object that is a payload as well as a payload receiver.
 */
abstract class HybridPayload<T> extends PayloadReceiver<T> {
  constructor(element: JQW, hook: PayloadHookFunc<T>) {
    super(element, hook);

    this.asElement().mousedown((e: JQueryMouseEventObject) => {
      if (this.canBePayload())
        MousePayload.setPayload(this, e);
    });
  }

  /** call the payload hook function to determine if this object can be a payload */
  private canBePayload(): boolean {
    return this.payloadHook !== undefined && this.payloadHook(PayloadHookRequest.IS_PAYLOAD, undefined, this.getObjectData());
  }
}
