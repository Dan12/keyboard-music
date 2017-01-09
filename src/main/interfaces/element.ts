/**
 * The abstract element class. It tells the client that the extending
 * class can be treated as a JQuery element
 */
abstract class DomElement {
  /** the element representing this object */
  protected element: JQW;

  constructor(element: JQW) {
    this.element = element;
  }

  /**
   * @return This objects's elelemt
   */
  public asElement(): JQW {
    return this.element;
  }
}
