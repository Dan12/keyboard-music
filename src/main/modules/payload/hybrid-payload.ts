abstract class HybridPayload<T> extends PayloadReceiver<T> {
  constructor(element: JQueryWrapper, hook: PayloadHookFunc<T>) {
    super(element, hook);

    this.asElement().mousedown((e: JQueryMouseEventObject) => {
      if (this.canBePayload())
        MousePayload.setPayload(this, e);
    });
  }

  public canBePayload(): boolean {
    return this.payloadHook !== undefined && this.payloadHook(PayloadHookRequest.IS_PAYLOAD, undefined, this.getObjectData());
  }
}
