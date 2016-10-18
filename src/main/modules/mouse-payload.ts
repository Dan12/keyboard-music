/**
 * Maintain the current payload of the mouse
 *
 * @static
 */
class MousePayload {

  private static listen_element: JQuery;

  public static initialize(element: JQuery) {
    MousePayload.listen_element = element;

    MousePayload.listen_element.mousemove((e: JQueryMouseEventObject) => {
      let target = e.target;
    });
  }

}
