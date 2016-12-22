/**
 * Maintain the current payload of the mouse
 * @class MousePayload
 * @static
 */
class MousePayload {

  private static listen_element: JQuery;

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

}
