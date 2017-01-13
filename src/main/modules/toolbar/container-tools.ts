class ContainerTools extends DomElement {

  private pitchContainer: JQW;
  private loop: JQW;
  private holdToPlay: JQW;
  private quaternize: JQW;

  constructor() {
    super(new JQW('<div id="container-tools" class="horizontal-column"></div>'));

    let pitches = new JQW('<div id="pitches" class="horizontal-column"><h3>Pitches</h3></div>');
    this.asElement().append(pitches);
    this.pitchContainer = new JQW('<div id="pitch-container"></div>');
    pitches.append(this.pitchContainer);

    let controls = new JQW('<div id="controls" class="horizontal-column"></div>');
    this.asElement().append(controls);

    this.loop = new JQW('<div id="loop" class="container-button">Loop</div>');
    controls.append(this.loop);

    this.holdToPlay = new JQW('<div id="hold-to-play" class="container-button">Hold To Play</div>');
    controls.append(this.holdToPlay);

    this.quaternize = new JQW('<div id="quaternize">Quaternize:</div>');
    controls.append(this.quaternize);
  }

  public inspectContainer(soundContainer: SoundContainer) {
    console.log('inspect container');
    console.log(soundContainer);
  }
}
