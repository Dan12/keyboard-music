/// <reference path="../../interfaces/element.ts"/>

/**
 * a payload class for an element
 * @class Payload
 */
abstract class Payload extends JQElement {
  constructor(element: JQueryWrapper) {
    super(element);

    this.asElement().mousedown((e: JQueryMouseEventObject) => {
      MousePayload.setPayload(this, e);
    });
  }
}
