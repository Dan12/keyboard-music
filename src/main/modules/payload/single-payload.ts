/**
 * an extension to the element class that represents a single payload
 */
abstract class SinglePayload extends DomElement implements Highlightable, Payload {
  constructor(element: JQW) {
    super(element);

    this.asElement().mousedown((e: JQueryMouseEventObject) => {
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
}
