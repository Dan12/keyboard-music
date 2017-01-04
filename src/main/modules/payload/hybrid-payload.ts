abstract class HybridPayload extends PayloadReceiver {
  constructor(element: JQuery) {
    super(element);

    this.asElement().mousedown((e: JQueryMouseEventObject) => {
      if (this.canBePayload())
        MousePayload.setPayload(this, e);
    });
  }

  abstract canBePayload(): boolean;
}
