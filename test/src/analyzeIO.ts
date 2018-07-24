class AnalyzeIO extends AbstractIO<KeyboardMessage, void> {
  private analyze: WaveformAnalyzer;

  constructor(analyze: WaveformAnalyzer) {
    super();
    this.analyze = analyze;
  }

  public receiveMessage(msg: KeyboardMessage) {
    if (msg.keyCode === 32) {
      if (msg.direction === KeyDirection.DOWN) {
        this.analyze.pressSpace();
      }
      // space presses recently selected button on chrome
      msg.event.preventDefault();
    }
  }
}