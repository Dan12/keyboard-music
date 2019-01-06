class KeyboardKey extends DomElt {

  private ink: HTMLElement;

  constructor(key: string) {
    super("div", {class: "keyboard-key"}, key);
  }

  public setColor(color: string) {
    this.elt.style.backgroundColor = color;
  }

  public ripple() {
    if (!this.ink) {
      this.ink = DomUtils.makeElt("span", {class: "ink"}, "");
      this.elt.prepend(this.ink);
    }

    // incase of quick double clicks stop the previous animation
    this.ink.classList.remove("animate");

    // set size of .ink
    if (!this.ink.style.height && !this.ink.style.width) {
      // use parent's width or height whichever is larger for the diameter to make a circle which can cover the entire element.
      let d = Math.max(this.elt.clientWidth, this.elt.clientHeight);
      this.ink.style.width = `${d}px`;
      this.ink.style.height = `${d}px`;
    }

    // set the position and add class .animate
    this.ink.style.top = "0px";
    this.ink.style.left = "0px";
    setTimeout(() => {
      this.ink.classList.add("animate");
    }, 1);
  }
}