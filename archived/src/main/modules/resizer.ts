// Resize event handler. Register a resize event and call resize
class Resizer {
  private static callbacks: ((e?: any) => any)[];

  public static resize(callback: (e?: any) => any) {
    if(Resizer.callbacks === undefined) {
      Resizer.callbacks = [];
      window.addEventListener('resize', Resizer.onResize);
    }
    Resizer.callbacks.push(callback);
  }

  private static onResize(e: any) {
    for(let c of Resizer.callbacks)
      c(e);
  }
}