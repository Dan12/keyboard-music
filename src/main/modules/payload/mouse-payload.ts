/// <reference path="./payload.ts"/>
/// <reference path="./payload-receiver.ts"/>
/// <reference path="./hybrid-payload.ts"/>
/// <reference path="./payload-utils.ts"/>

/**
 * Maintain the current payload of the mouse
 * @class MousePayload
 * @static
 */
class MousePayload {

  private static listen_element: JQueryWrapper;

  private static payload: Payload;

  private static payloadElement: JQueryWrapper;
  private static xOffset: number;
  private static yOffset: number;

  /**
   * initialize the mouse payload object
   * @method initialize
   * @static
   */
  public static initialize(element: JQueryWrapper) {
    MousePayload.listen_element = element;

    MousePayload.listen_element.mousemove((e: JQueryMouseEventObject) => {
      let target = e.target;
      // console.log(target);
      if (MousePayload.payload !== undefined) {
        if (MousePayload.payloadElement === undefined) {
          MousePayload.payloadElement = MousePayload.payload.asElement().clone();
          MousePayload.listen_element.append(MousePayload.payloadElement);
          MousePayload.payloadElement.css({'position': 'absolute', 'pointer-events': 'none', 'opacity': '0.5'});
        }
        MousePayload.payloadElement.css(
          {'left': (e.pageX + MousePayload.xOffset) + 'px', 'top': (e.pageY + MousePayload.yOffset) + 'px'}
        );
      }

      e.preventDefault();
      return false;
    });

    MousePayload.listen_element.mouseup((e: JQueryMouseEventObject) => {
      MousePayload.popPayload();
    });
  }

  public static setPayload(payload: Payload, e: JQueryMouseEventObject) {
    MousePayload.payload = payload;
    let offset = MousePayload.payload.asElement().offset();
    MousePayload.xOffset = offset.left - e.pageX;
    MousePayload.yOffset = offset.top - e.pageY;
  }

  public static peekPayload(): Payload {
    return MousePayload.payload;
  }

  public static popPayload(): Payload {
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
