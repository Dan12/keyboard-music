class ContainerTools extends DomElement {

  private pitchContainer: JQW;
  private loop: JQW;
  private holdToPlay: JQW;
  private quaternize: JQW;
  private linkedAreas: JQW;

  private currentContaier: SoundContainer;

  private currentSound: number;
  private containerLocation: number;
  private pitches: PitchElement[];

  constructor() {
    super(new JQW('<div id="container-tools" class="horizontal-column"></div>'));

    this.pitches = [];

    let pitches = new JQW('<div id="pitches" class="horizontal-column"><h3>Pitches</h3></div>');
    this.asElement().append(pitches);
    this.pitchContainer = new JQW('<div id="pitch-container"></div>');
    pitches.append(this.pitchContainer);

    let controls = new JQW('<div id="controls" class="horizontal-column"></div>');
    this.asElement().append(controls);

    this.loop = new JQW('<div id="loop" class="container-button">Loop</div>');
    controls.append(this.loop);
    this.loop.click(() => {
      if (this.currentContaier !== undefined) {
        this.currentContaier.setLoop(!this.currentContaier.getLoop());

        if (this.currentContaier.getLoop())
          this.loop.addClass('true');
        else
          this.loop.removeClass('true');
      }
    });

    this.holdToPlay = new JQW('<div id="hold-to-play" class="container-button">Hold To Play</div>');
    controls.append(this.holdToPlay);
    this.holdToPlay.click(() => {
      if (this.currentContaier !== undefined) {
        this.currentContaier.setHoldToPlay(!this.currentContaier.getHoldToPlay());

        if (this.currentContaier.getHoldToPlay())
          this.holdToPlay.addClass('true');
        else
          this.holdToPlay.removeClass('true');
      }
    });

    this.quaternize = new JQW('<div id="quaternize">Quaternize:</div>');
    controls.append(this.quaternize);

    let areasContainer = new JQW('<div id="areas_container">Linked Areas:</div>');
    controls.append(areasContainer);
    this.linkedAreas = new JQW('<div id="linked_areas"></div>');
    areasContainer.append(this.linkedAreas);
    this.linkedAreas.hide();
    let areasButton = new JQW('<button>New Area</button>');
    areasContainer.append(areasButton);
  }

  public clearData() {
    this.currentContaier = undefined;

    this.pitchContainer.empty();
    this.loop.removeClass('true');
    this.holdToPlay.removeClass('true');
    this.quaternize.html('Quaternize:');
    this.linkedAreas.empty();
    this.pitches = [];

    this.asElement().hide();
  }

  public deleteKey(): boolean {
    if (this.currentSound !== undefined) {
      this.pitches[this.currentSound].asElement().remove();
      this.pitches.splice(this.currentSound, 1);
      this.currentContaier.removePitch(this.currentSound);
      if (this.currentContaier.getPitches().length === 0) {
        SongManager.getCurrentPack().removeContainer(this.containerLocation);
        Creator.getInstance().removedKey(this.containerLocation);
        this.clearData();
        return true;
      }
    }
    return false;
  }

  public inspectContainer(loc: number) {
    this.asElement().show();

    this.containerLocation = loc;

    this.currentContaier = SongManager.getCurrentPack().getContainer(this.containerLocation);

    this.pitchContainer.empty();
    this.pitches = [];

    for (let i = 0; i < this.currentContaier.getPitches().length; i++) {
      let pitchElement = new PitchElement(i, this.currentContaier.getPitches()[i].getLoc());
      this.pitches.push(pitchElement);
      pitchElement.asElement().click(() => {
        this.currentSound = pitchElement.getInd();
        Toolbar.getInstance().inspectSound(this.currentContaier.getPitches()[pitchElement.getInd()], pitchElement, true, true);
      });

      if (i === 0) {
        pitchElement.asElement().click();
      }

      this.pitchContainer.append(pitchElement.asElement());
    }

    if (this.currentContaier.getLoop())
      this.loop.addClass('true');

    if (this.currentContaier.getHoldToPlay())
      this.holdToPlay.addClass('true');

    this.quaternize.html('Quaternize: ' + this.currentContaier.getQuaternize());
  }
}

class PitchElement extends DomElement {
  private ind: number;

  constructor(ind: number, loc: string) {
    super(new JQW('<div class="pitch">' + loc + '</div>'));

    this.ind = ind;
  }

  public getInd(): number {
    return this.ind;
  }

}
