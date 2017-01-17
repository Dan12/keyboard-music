class Splitter extends DomElement {

  private static instance: Splitter;

  public static getInstance(): Splitter {
    if(Splitter.instance === undefined) {
      Splitter.instance = new Splitter();
    }

    return Splitter.instance;
  }

  constructor() {
    super(new JQW('<div id="splitter"></div>'));

    this.asElement().append('<h2>Splitter</h2>');
  }
}
