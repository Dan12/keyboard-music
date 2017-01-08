/**
 * The abstract element class. It tells the client that the extending
 * class can be treated as a JQuery element
 *
 * @class JQElement
 * @constructor
 * @param elelemt {JQueryWrapper} the jQuery element representing this object
 */
abstract class JQElement {
  protected element: JQueryWrapper;

  constructor(element: JQueryWrapper) {
    this.element = element;
  }

  /**
   * @method asElement
   * @return {JQuery} This element's jQuery elelemt
   */
  public asElement(): JQueryWrapper {
    return this.element;
  }
}
