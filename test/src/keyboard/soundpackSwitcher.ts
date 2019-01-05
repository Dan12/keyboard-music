class SoundpackSwitcher extends DomElt {

  private soundpackElements: HTMLElement[];
  private soundpackInfo: HTMLElement;

  constructor() {
    super("div", {id: "soundpack-switcher"}, "");

    const keys = ["^", "<", "v", ">"];

    this.soundpackElements = [];

    keys.forEach(key => {
      let elt = DomUtils.makeElt("div", {class: "soundpack-button"}, key);
      this.soundpackElements.push(elt);
      this.elt.appendChild(elt);
    });

    this.soundpackElements[0].classList.add("soundpack-block");

    this.soundpackInfo = DomUtils.makeElt("div", {id: "soundpack-info"}, "Sound Pack: 1");

    let tmp = this.soundpackElements[0];
    this.soundpackElements[0] = this.soundpackElements[1];
    this.soundpackElements[1] = tmp;

    this.setPack(0);
  }

  public setPack(pack: number) {
    this.soundpackElements.forEach(elt => {
      elt.classList.remove("highlight-soundpack");
    });

    this.soundpackElements[pack].classList.add("highlight-soundpack");

    this.soundpackInfo.innerHTML = `Sound Pack ${pack}`;
  }

}