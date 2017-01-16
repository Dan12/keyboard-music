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

  public updateSong() {
    this.songTools.updateSong();
  }

  public switchedSoundPack() {
    this.containerTools.clearData();
    if (this.prevHighlight.length > 1)
      this.soundTools.clearData();
    this.controlHighlight(undefined, false);
  }

  /** determine the key press action based on the keycode */
  public keyPress(keyCode: number) {
    if (keyCode === 32) {
      this.soundTools.pressSpace();
    } else if (keyCode === 8) {
      if (this.containerTools.deleteKey()) {
        this.soundTools.clearData();
        this.controlHighlight(undefined, false);
      }
    }
  }

  public focusedKeyPress(keyCode: number) {
    if (keyCode === 13) {
      this.songTools.enterPress();
    }
  }

  /**
   * inspect the given sound and highlight the given element
   * @param sound the sound to inspect
   * @param element the DomElement to highlight indicating that it is being inspected
   * @param inOutControls if true, disable the set in and set out controls
   * @param fromContainerTools an internal flag that should only be set to true
   *        if this inspect request is coming from the container tools class
   */
  public inspectSound(sound: Sound, element: DomElement, inOutControls: boolean, fromContainerTools?: boolean) {
    if (fromContainerTools === undefined || !fromContainerTools) {
      this.containerTools.clearData();
      this.controlHighlight(element, false);
    } else {
      this.controlHighlight(element, true);
    }

    this.soundTools.inspectSound(sound, inOutControls);
  }

  /** inspect the given container */
  public inspectContainer(key: KeyboardKey) {
    let loc = KeyboardUtils.gridToLinear(key.getRow(), key.getCol(), key.getKeyboard().getNumCols());

    this.controlHighlight(key, false);

    this.soundTools.clearData();

    this.containerTools.inspectContainer(loc);
  }

  /**
   * control the highlighting effect.
   * @param newHighlight the new element to highlight; if undefined, clear highlighting
   * @param keepOld if true, don't clear the old highlighted element
   */
  private controlHighlight(newHighlight: DomElement, keepOld: boolean) {
    // unhighlight old element if allowed
    if (this.prevHighlight.length > 0 && !keepOld) {
      for (let elem of this.prevHighlight) {
        if (elem instanceof KeyboardKey) {
          elem.unHighlight();
        } else {
          elem.asElement().removeClass('highlight');
        }
      }

      this.prevHighlight = [];
    } else if (this.prevHighlight.length === 2) {
      this.prevHighlight.pop().asElement().removeClass('highlight');
    }

    // add the new highlight element to the queue
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
