class MiniPlayer extends DomElt {
  private timelineProgressBar: HTMLElement;
  private playPauseElt: HTMLElement;

  constructor() {
    super("div", {id: "mini-player"}, "");

    this.playPauseElt = DomUtils.makeElt("div", {id: "play-pause"}, ">");
    this.playPauseElt.addEventListener("click", () => {this.playPause(); });
    this.elt.appendChild(this.playPauseElt);

    const stopElt = DomUtils.makeElt("div", {id: "stop-button"}, "[]");
    stopElt.addEventListener("click", () => {
      MidiPlayer.MidiPlayer().stop();
      this.playPauseElt.innerHTML = ">";
    });
    this.elt.appendChild(stopElt);

    const timelineBar = DomUtils.makeElt("div", {id: "timeline-bar"}, "");
    this.timelineProgressBar = DomUtils.makeElt("div", {id: "timeline-progress-bar"}, "");
    timelineBar.appendChild(this.timelineProgressBar);
    this.elt.appendChild(timelineBar);

    timelineBar.addEventListener("click", (event) => {
      let rect = timelineBar.getBoundingClientRect();
      let xPos = event.pageX - rect.left;
      let percent = xPos / 202;
      let beat = NoteManager.NoteManager().getMaxNoteBeat() * percent;
      MidiPlayer.MidiPlayer().setCurrentBeat(beat);
    });

    this.timelineProgressBar.style.width = "0%";

    const timelineInfo = DomUtils.makeElt("div", {id: "timeline-info"}, "0/0");
    this.elt.appendChild(timelineInfo);

    MidiPlayer.MidiPlayer().addTickListener((beat: number) => {
      this.timelineProgressBar.style.width = `${beat * 100 / NoteManager.NoteManager().getMaxNoteBeat()}%`;
      timelineInfo.innerHTML = `${Math.floor(beat)}/${NoteManager.NoteManager().getMaxNoteBeat()}`;
    });
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