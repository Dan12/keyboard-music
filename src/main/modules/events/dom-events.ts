class DomEvents {

  /** add a listener on the element for the given event */
  public static addListener(elem: Element, name: string, callback: (event?: Event) => any) {
    elem.addEventListener(name, callback);
  }

  /** fire the event on the given element */
  public static fireEvent(elem: Element, name: string, args?: any) {
    let event: Event;
    if (args === undefined)
      event = new Event(name);
    else
      event = new CustomEvent(name, {'detail': args});
    elem.dispatchEvent(event);
  }
}
