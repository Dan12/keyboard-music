/**
 * an extension to the element class that represents a payload
 */
abstract class Payload extends DomElement {
  constructor(element: JQW) {
    super(element);

    this.asElement().mousedown((e: JQueryMouseEventObject) => {
      MousePayload.setPayload(this, e);
    });
  }
}
