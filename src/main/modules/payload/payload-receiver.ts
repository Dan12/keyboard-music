/**
 * a class that can recieve a payload
 * @class PayloadReceiver
 */
abstract class PayloadReceiver extends JQElement {
  constructor(element: JQuery) {
    super(element);

    this.asElement().mouseup((e: JQueryMouseEventObject) => {
      let payload = MousePayload.peekPayload();
      // only consume the payload if you can recieve it
      if (payload !== undefined && this.canReceive(payload)) {
        this.receivePayload(MousePayload.popPayload());
        this.asElement().css('color', '');
      }
    });

    // highlight on mouseover
    this.asElement().mouseenter((e: JQueryMouseEventObject) => {
      let payload = MousePayload.peekPayload();
      if (payload !== undefined && this.canReceive(payload))
        this.asElement().css('color', 'rgba(0,200,200, 0.3)');
    });

    this.asElement().mouseleave(() => {
      this.asElement().css('color', '');
    });
  }

  abstract canReceive(payload: Payload): boolean;

  /**
   * handle the payload that was received
   * @method receivePayload
   * @param {Payload} payload
   */
  abstract receivePayload(payload: Payload): void;
}
