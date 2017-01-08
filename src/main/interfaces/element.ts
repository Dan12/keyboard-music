/**
 * The abstract element class. It tells the client that the extending
 * class can be treated as a JQuery element
 *
 * @class JQElement
 * @constructor
 * @param elelemt {JQW} the jQuery element representing this object
 */
abstract class DomElement {
  protected element: JQW;

  constructor(element: JQW) {
    this.element = element;
  }

  /**
   * @method asElement
   * @return {JQW} This element's jQuery elelemt
   */
  public asElement(): JQW {
    return this.element;
  }
}
