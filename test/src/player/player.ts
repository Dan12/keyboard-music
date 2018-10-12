/// <reference path="note.ts"/>

class Player extends DomElt {
  private notes: Notes;

  private Keys =
    ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0", "-", "=",
     "Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P", "[", "]",
     "A", "S", "D", "F", "G", "H", "J", "K", "L", ";", "'", "\\n",
     "Z", "X", "C", "V", "B", "N", "M", ", ", ".", "/", "\\s", "NA"];

  private numBeats = 40;

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

    const barContainer = DomUtils.makeElt("div", {id: "barContainer"}, "");
    for (let i = 0; i < this.Keys.length; i++) {
      const bar = DomUtils.makeElt("div", {class: "bar"}, "");
      barContainer.appendChild(bar);
    }

    const noteContainer = DomUtils.makeElt("div", {id: "noteContainer"}, "");
    const note = DomUtils.makeElt("div", {class: "note"}, "");
    note.style.left = "40px";
    // note.style.top = "40px";
    noteContainer.appendChild(note);

    for (let i = 0; i < this.numBeats; i++) {
      const beatLine = DomUtils.makeElt("div", {class: "beatLine"}, `${i}`);
      timeline.appendChild(beatLine);
    }

    bottomSubContainer.appendChild(barContainer);
    bottomSubContainer.appendChild(noteContainer);

    let scrollX = 0;
    let scrollY = 0;
    bottomContaier.addEventListener("mousewheel", e => {
      scrollX -= e.deltaX;
      scrollY -= e.deltaY;
      if (scrollX > 0) {
        scrollX = 0;
      }
      const maxX = timeline.offsetWidth - bottomContaier.offsetWidth;
      if (scrollX < -maxX) {
        scrollX = -maxX;
      }
      if (scrollY > 0) {
        scrollY = 0;
      }
      // 19 = bottom.top+1
      const maxY = barContainer.offsetHeight + 19 - bottomContaier.offsetHeight;
      if (scrollY < -maxY) {
        scrollY = -maxY;
      }
      keyContainer.setAttribute("style", "top: " + scrollY + "px");
      timeline.setAttribute("style", "left: " + scrollX + "px");
      barContainer.setAttribute("style", "top: " + scrollY + "px");
      noteContainer.setAttribute("style", "left: " + scrollX + "px; top: " + scrollY + "px");
      e.preventDefault();
    });
  }
}