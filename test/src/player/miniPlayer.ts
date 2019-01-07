class MiniPlayer extends DomElt {
  private timelineProgressBar: HTMLElement;
  private playPauseElt: HTMLElement;

  constructor() {
    super("div", {id: "mini-player"}, "");

    this.playPauseElt = DomUtils.makeElt("div", {id: "play-pause"}, ">");
    this.playPauseElt.addEventListener("click", () => {this.playPause(); });
    this.elt.appendChild(this.playPauseElt);

    let timelineBar = DomUtils.makeElt("div", {id: "timeline-bar"}, "");
    this.timelineProgressBar = DomUtils.makeElt("div", {id: "timeline-progress-bar"}, "");
    timelineBar.appendChild(this.timelineProgressBar);
    this.elt.appendChild(timelineBar);
  }

  private playPause() {
    let playing = MidiPlayer.MidiPlayer().playPause();
    if (playing) {
      this.playPauseElt.innerHTML = "||";
    } else {
      this.playPauseElt.innerHTML = ">";
    }
  }
}