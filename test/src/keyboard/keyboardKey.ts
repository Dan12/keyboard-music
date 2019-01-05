class KeyboardKey extends DomElt {

  constructor(key: string) {
    super("div", {class: "keyboard-key"}, key);
  }

  public setColor(color: string) {
    this.elt.style.backgroundColor = color;
  }
}