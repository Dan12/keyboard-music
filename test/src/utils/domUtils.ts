class DomUtils {
  public static makeElt(tag: string, attrs: any, content: string): HTMLElement {
    let elt = document.createElement(tag);
    if (content !== "") {
      elt.appendChild(document.createTextNode(content));
    }
    for (let attr in attrs) {
     elt.setAttribute(attr, attrs[attr]);
    }
    return elt;
   }
}

abstract class DomElt {
  protected elt: HTMLElement;

  constructor(tag: string, attrs: any, content: string) {
    this.elt = DomUtils.makeElt(tag, attrs, content);
  }

  public getElt(): HTMLElement {
    return this.elt;
  }
}