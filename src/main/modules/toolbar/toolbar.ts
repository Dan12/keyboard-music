/// <reference path="./container-tools.ts"/>
/// <reference path="./song-tools.ts"/>
/// <reference path="./sound-tools.ts"/>

/**
 * A gui class for inspecting a sound file
 */
class Toolbar extends DomElement {

  private static instance: Toolbar;

  private songTools: SongTools;
  private soundTools: SoundTools;
  private containerTools: ContainerTools;

  private prevHighlight: DomElement[];

  /**
   * @return the singleton instance of this class
   */
  public static getInstance(): Toolbar {
    if (Toolbar.instance === undefined) {
      Toolbar.instance = new Toolbar();
    }

    return Toolbar.instance;
  }

  private constructor() {
    super(new JQW('<div id="toolbar"></div>'));

    this.songTools = new SongTools();
    this.asElement().append(this.songTools.asElement());

    this.containerTools = new ContainerTools();
    this.asElement().append(this.containerTools.asElement());

    this.soundTools = new SoundTools();
    this.asElement().append(this.soundTools.asElement());

    this.soundTools.asElement().hide();
    this.containerTools.asElement().hide();

    this.prevHighlight = [];
  }

  public keyPress(keyCode: number): boolean {
    if (keyCode === 32) {
      this.soundTools.pressSpace();
      return false;
    } else if (keyCode === 8) {
      if (this.containerTools.deleteKey()) {
        this.soundTools.clearData();
        this.controlHighlight(undefined, false);
      }
    }

    return true;
  }

  public inspectSound(sound: Sound, element: DomElement, inOutControls: boolean, fromContainerTools?: boolean) {
    if (fromContainerTools === undefined || !fromContainerTools) {
      this.containerTools.clearData();
      this.controlHighlight(element, false);
    } else {
      this.controlHighlight(element, true);
    }

    this.soundTools.inspectSound(sound, inOutControls);
  }

  public inspectContainer(key: KeyboardKey) {
    let loc = KeyboardUtils.gridToLinear(key.getRow(), key.getCol(), key.getKeyboard().getNumCols());

    this.controlHighlight(key, false);

    this.soundTools.clearData();

    this.containerTools.inspectContainer(loc);
  }

  private controlHighlight(newHighlight: DomElement, keepOld: boolean) {
    // remove old
    if (this.prevHighlight.length > 0 && !keepOld) {
      for (let elem of this.prevHighlight) {
        if (elem instanceof KeyboardKey) {
          elem.unHighlight();
        } else {
          elem.asElement().removeClass('highlight');
        }
      }

      this.prevHighlight = [];
    }

    if (newHighlight !== undefined) {
      if (newHighlight instanceof KeyboardKey) {
          newHighlight.highlight();
      } else {
        newHighlight.asElement().addClass('highlight');
      }
      this.prevHighlight.push(newHighlight);
    }
  }
}
