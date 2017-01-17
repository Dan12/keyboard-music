/// <reference path="./payload.ts"/>
/// <reference path="./payload-receiver.ts"/>
/// <reference path="./hybrid-payload.ts"/>
/// <reference path="./payload-utils.ts"/>
/// <reference path="./multi-payload.ts"/>

/**
 * Maintain the current payload of the mouse
 */
class MousePayload {
  // the element to listen for mouse events on
  private static listen_element: JQW;

  // the current payload object, undefined if no current payload
  private static payload: Payload;

  // the current payload element to bind to the mouse position, undefined if no current payload
  private static payloadElement: JQW;

  // keep track of the payload x and y offsets from the mouse to provide seemless animation
  private static xOffset: number;
  private static yOffset: number;

  private static multiPayload: MultiPayload;

  /**
   * initialize the mouse payload object
   */
  public static initialize(element: JQW) {
    MousePayload.listen_element = element;

    MousePayload.listen_element.mousemove((e: JQueryMouseEventObject) => {
      if (MousePayload.payload !== undefined) {
        if (MousePayload.payloadElement === undefined) {
          // clone the payload element and attach it to the mouse pointer
          MousePayload.payloadElement = MousePayload.payload.asElement().clone();
          MousePayload.listen_element.append(MousePayload.payloadElement);
          MousePayload.payloadElement.css({'position': 'absolute', 'pointer-events': 'none', 'opacity': '0.5'});
        }
        // TODO maybe define some small sensitivity for the mouse movement
        // move the payload clone element to the mouse position
        MousePayload.payloadElement.css(
          {'left': (e.pageX + MousePayload.xOffset) + 'px', 'top': (e.pageY + MousePayload.yOffset) + 'px'}
        );
      } else if (MousePayload.multiPayload !== undefined) {
        MousePayload.multiPayload.mouseMove(e);
      }

      // prevent highlight/selecting on dragging
      e.preventDefault();
      return false;
    });

    MousePayload.listen_element.mouseup((e: JQueryMouseEventObject) => {
      // if the multi payoad has not yet had it's first pop
      if (!(MousePayload.multiPayload !== undefined && (MousePayload.multiPayload.firstPop() || MousePayload.multiPayload.isUnloading()))) {
        MousePayload.popPayload();
        MousePayload.clearMultiPayload();
      }
    });
  }

  /** set the potential multi payload */
  public static setMultiPayload(multi: MultiPayload) {
    MousePayload.multiPayload = multi;
  }

  public static clearMultiPayload() {
    if (MousePayload.multiPayload !== undefined)
      MousePayload.multiPayload.clearPayload();
    MousePayload.multiPayload = undefined;
  }

  /** @return true if there is a mouse payload */
  public static hasPayload(): boolean {
    return MousePayload.payload !== undefined || MousePayload.multiPayload !== undefined;
  }

  /**
   * set the payload of the mouse and define some offsets
   */
  public static setPayload(payload: Payload, e: JQueryMouseEventObject) {
    if (!(MousePayload.multiPayload !== undefined && MousePayload.multiPayload.setPayload(payload, e, MousePayload.listen_element))) {
      // if the payload was not part of the multi payload, remove the multi payload
      MousePayload.clearMultiPayload();

      MousePayload.payload = payload;
      let offset = MousePayload.payload.asElement().offset();
      MousePayload.xOffset = offset.left - e.pageX;
      MousePayload.yOffset = offset.top - e.pageY;
    }
  }

  /**
   * get the payload without popping it
   */
  public static peekPayload(): Payload {
    if (MousePayload.multiPayload !== undefined && MousePayload.multiPayload.isPayload())
      return MousePayload.multiPayload;
    else
      return MousePayload.payload;
  }

  /**
   * return the payload and clear the payload from the mouse
   */
  public static popPayload(): Payload {
    if (MousePayload.multiPayload !== undefined) {
      return MousePayload.multiPayload.popNextPayload();
    }
    else {
      let ret = MousePayload.payload;

      // clear the payload
      MousePayload.payload = undefined;
      if (MousePayload.payloadElement !== undefined) {
        MousePayload.payloadElement.remove();
      }
      MousePayload.payloadElement = undefined;
      MousePayload.xOffset = undefined;
      MousePayload.yOffset = undefined;

      return ret;
    }
  }

}
