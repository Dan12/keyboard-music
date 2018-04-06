abstract class AbstractIO <I, O> {
  public receiveMessage(msg: I) {
    // Do nothing
  }

  private listeners: AbstractIO<O, any>[] = [];
  public attachListener (l: AbstractIO<O, any>) {
    this.listeners.push(l);
  }

  protected sendMessage(msg: O) {
    this.listeners.forEach((i: AbstractIO<O, any>) => {
      i.receiveMessage(msg);
    });
  }
}