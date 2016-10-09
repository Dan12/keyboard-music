/**
 * The abstract element class. It tells the client that the extending
 * class can be treated as a JQuery element
 *
 * @class Elelement
 * @constructor
 * @param elelemt {JQuery} the jQuery element representing this object
 */

export abstract class Element {
  protected element: JQuery;

  constructor(element: JQuery) {
    this.element = element;
  }

  /**
   * @method asElement
   * @return {JQuery} This element's jQuery elelemt
   */
  public asElement(): JQuery {
    return this.element;
  }
}
