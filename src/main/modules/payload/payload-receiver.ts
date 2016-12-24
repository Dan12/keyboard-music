/**
 * a class that can recieve a payload
 * @class PayloadReceiver
 */
abstract class PayloadReceiver extends JQElement {
  constructor(element: JQuery) {
    super(element);

    this.asElement().mouseup((e: JQueryMouseEventObject) => {
      let payload = MousePayload.popPayload();
      if (payload !== undefined && this.canReceive(payload))
        this.receivePayload(payload);
    });

    // highlight on mouseover
    this.asElement().mouseover((e: JQueryMouseEventObject) => {
      let payload = MousePayload.peekPayload();
      if (payload !== undefined && this.canReceive(payload))
        this.asElement().css('background-color', 'rgba(0,200,200, 0.3)');
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
