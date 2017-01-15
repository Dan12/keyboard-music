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

  private static LINKED_AREA_KEY_HIGHLIGHT = 'rgb(100,220,220)';

  constructor() {
    super(new JQW('<div id="container-tools" class="horizontal-column"></div>'));

    this.pitches = [];

    // add the pitches container
    let pitches = new JQW('<div id="pitches" class="horizontal-column"><h3>Pitches</h3></div>');
    this.asElement().append(pitches);
    this.pitchContainer = new JQW('<div id="pitch-container"></div>');
    pitches.append(this.pitchContainer);

    let controls = new JQW('<div id="controls" class="horizontal-column"></div>');
    this.asElement().append(controls);

    // add the loop switch
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

    // add the hold to play switch
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

    // add the quaternize label
    this.quaternize = new JQW('<div id="quaternize">Quaternize:</div>');
    controls.append(this.quaternize);

    // add the linked areas container
    let areasContainer = new JQW('<div id="areas_container">Linked Areas:</div>');
    controls.append(areasContainer);
    this.linkedAreas = new JQW('<div id="linked_areas"></div>');
    areasContainer.append(this.linkedAreas);
    this.linkedAreas.hide();
    let areasButton = new JQW('<button>New Area</button>');
    areasContainer.append(areasButton);
    areasButton.click(() => {
      if (this.currentContaier !== undefined) {
        let newInd = SongManager.getCurrentPack().addLinkedArea();
        this.addLinkedArea(newInd);
        this.linkedAreas.show();
      }
    });
  }

  /** clear add the data and hide this element */
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

  /** called when the delete key is pressed. If possible, delete the selected pitch in the selected container */
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

  /** inspect the given container and show this element */
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

    let lnkdAreas = SongManager.getCurrentPack().getLinkedAreas();
    this.linkedAreas.empty();
    this.linkedAreas.hide();
    if (lnkdAreas.length > 0) {
      this.linkedAreas.show();
    }
    for (let i = 0; i < lnkdAreas.length; i++) {
      let area = this.addLinkedArea(i);
      for (let j = 0; j < lnkdAreas[i].length; j++) {
        if (lnkdAreas[i][j] === this.containerLocation) {
          area.addClass('in_area');
        }
      }
    }

    if (this.currentContaier.getLoop())
      this.loop.addClass('true');

    if (this.currentContaier.getHoldToPlay())
      this.holdToPlay.addClass('true');

    this.quaternize.html('Quaternize: ' + this.currentContaier.getQuaternize());
  }

  private addLinkedArea(ind: number): JQW {
    let area = new JQW('<span>' + ind + '</span>');
    this.linkedAreas.append(area);

    area.mouseenter(() => {
      for (let i = 0; i < SongManager.getCurrentPack().getLinkedAreas()[ind].length; i++) {
        Creator.getInstance().getKey(
          SongManager.getCurrentPack().getLinkedAreas()[ind][i]
        ).setCSS({'color': ContainerTools.LINKED_AREA_KEY_HIGHLIGHT});
      }
    });

    area.mouseleave(() => {
      for (let i = 0; i < SongManager.getCurrentPack().getLinkedAreas()[ind].length; i++) {
        Creator.getInstance().getKey(SongManager.getCurrentPack().getLinkedAreas()[ind][i]).setCSS({'color': ''});
      }
    });

    area.click(() => {
      if (area.hasClass('in_area')) {
        area.removeClass('in_area');
        SongManager.getCurrentPack().removeFromLinkedArea(ind, this.containerLocation);
        Creator.getInstance().getKey(this.containerLocation).setCSS({'color': ''});
      } else {
        area.addClass('in_area');
        SongManager.getCurrentPack().addToLinkedArea(ind, this.containerLocation);
        Creator.getInstance().getKey(this.containerLocation).setCSS({'color': ContainerTools.LINKED_AREA_KEY_HIGHLIGHT});
      }
    });

    return area;
  }
}

/**
 * a simple element that is an alias for the pitches in the pitch container
 */
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
