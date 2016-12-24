/// <reference path="./payload.ts"/>
/// <reference path="./payload-receiver.ts"/>

/**
 * Maintain the current payload of the mouse
 * @class MousePayload
 * @static
 */
class MousePayload {

  private static listen_element: JQuery;

  private static payload: Payload;

  /**
   * initialize the mouse payload object
   * @method initialize
   * @static
   */
  public static initialize(element: JQuery) {
    MousePayload.listen_element = element;

    MousePayload.listen_element.mousemove((e: JQueryMouseEventObject) => {
      let target = e.target;
    });
  }

  public static setPayload(payload: Payload) {
    MousePayload.payload = payload;
  }

  public static peekPayload(): Payload {
    return MousePayload.payload;
  }

  public static popPayload(): Payload {
    let ret = MousePayload.payload;
    MousePayload.payload = undefined;
    return ret;
  }

}
