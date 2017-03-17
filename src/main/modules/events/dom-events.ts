class DomEvents {

  private static eventMap: {[name: string]: {(event?: Event): any; }[]} = {};

  /** add a listener on the element for the given event */
  public static addListener(name: string, callback: (event?: Event) => any, elem?: Element) {
    if (elem === undefined) {
      if (DomEvents.eventMap[name] === undefined)
        DomEvents.eventMap[name] = <{(event?: Event): any; }[]>[];
      DomEvents.eventMap[name].push(callback);
    }
    else
      elem.addEventListener(name, callback);
  }

  /** fire the event on the given element */
  public static fireEvent(name: string, args?: any, elem?: Element) {
    let event: Event;
    if (args === undefined)
      event = new Event(name, {'bubbles': true});
    else
      event = new CustomEvent(name, {'detail': args, 'bubbles': true});

    if (elem === undefined)
      for (let i = 0; i < DomEvents.eventMap[name].length; i++)
        DomEvents.eventMap[name][i](event);
    else
      elem.dispatchEvent(event);
  }
}
