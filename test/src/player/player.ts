/// <reference path="noteManager.ts"/>
/// <reference path="note.ts"/>

class Player extends DomElt {
  private Keys =
    ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0", "-", "=",
     "Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P", "[", "]",
     "A", "S", "D", "F", "G", "H", "J", "K", "L", ";", "'", "\\n",
     "Z", "X", "C", "V", "B", "N", "M", ", ", ".", "/", "\\s", "NA"];

  private numBeats = 40;

  public readonly barContainer: HTMLElement;
  public readonly noteContainer: HTMLElement;
  public scrollX = 0;
  public scrollY = 0;

  constructor() {
    super("div", {id: "player"}, "");

    const buttonContainer = DomUtils.makeElt("div", {id: "buttonContainer"}, "");
    for (let i = 0; i < 4; i++) {
      buttonContainer.appendChild(DomUtils.makeElt("div", {}, "Button"));
    }
    this.elt.appendChild(buttonContainer);

    const bottomContaier = DomUtils.makeElt("div", {id: "bottomContainer"}, "");
    this.elt.appendChild(bottomContaier);

    const timeline = DomUtils.makeElt("div", {id: "timeline"}, "");
    bottomContaier.appendChild(timeline);

    const bottomSubContainer = DomUtils.makeElt("div", {id: "bottomSubContainer"}, "");
    bottomContaier.appendChild(bottomSubContainer);

    const keyContainer = DomUtils.makeElt("div", {id: "keyContainer"}, "");
    for (let i = 0; i < this.Keys.length; i++) {
      keyContainer.appendChild(DomUtils.makeElt("div", {}, this.Keys[i]));
    }
    bottomSubContainer.appendChild(keyContainer);

    this.barContainer = DomUtils.makeElt("div", {id: "barContainer"}, "");
    for (let i = 0; i < this.Keys.length; i++) {
      const bar = DomUtils.makeElt("div", {class: "bar"}, "");
      this.barContainer.appendChild(bar);
    }

    this.noteContainer = DomUtils.makeElt("div", {id: "noteContainer"}, "");

    for (let i = 0; i < this.numBeats; i++) {
      const beatLine = DomUtils.makeElt("div", {class: "beatLine"}, `${i}`);
      timeline.appendChild(beatLine);
    }

    bottomSubContainer.appendChild(this.barContainer);
    bottomSubContainer.appendChild(this.noteContainer);

    bottomContaier.addEventListener("mousewheel", (e: WheelEvent) => {
      this.scrollX -= e.deltaX;
      this.scrollY -= e.deltaY;
      if (this.scrollX > 0) {
        this.scrollX = 0;
      }
      const maxX = timeline.offsetWidth - bottomContaier.offsetWidth;
      if (this.scrollX < -maxX) {
        this.scrollX = -maxX;
      }
      if (this.scrollY > 0) {
        this.scrollY = 0;
      }
      // 19 = bottom.top+1
      const maxY = this.barContainer.offsetHeight + 19 - bottomContaier.offsetHeight;
      if (this.scrollY < -maxY) {
        this.scrollY = -maxY;
      }
      keyContainer.setAttribute("style", "top: " + this.scrollY + "px");
      timeline.setAttribute("style", "left: " + this.scrollX + "px");
      this.barContainer.setAttribute("style", "top: " + this.scrollY + "px");
      this.noteContainer.setAttribute("style", "left: " + (this.scrollX + 22) + "px; top: " + this.scrollY + "px");
      e.preventDefault();
    });
  }
}