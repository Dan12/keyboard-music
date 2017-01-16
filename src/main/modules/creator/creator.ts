/// <reference path="./payload-keyboard.ts"/>
/// <reference path="./square-keyboard.ts"/>
/// <reference path="./mapto-keyboard.ts"/>
/// <reference path="./payload-alias.ts"/>
/// <reference path="./drag-selector.ts"/>

/**
 * the class to parent the creator gui for creating songs
 * @static
 */
class Creator extends DomElement {

  private static instance: Creator;

  /** The container for the creator dom objects */
  private main_content: JQW;

  // initial size metrics
  // TODO add ability to update
  private fileWidth = 160;
  private inspectorHeight = 120;
  private padding = 6;

  private mapTo: MapToKeyboard;
  private square: SquareKeyboard;

  private mouseDown: boolean;

  /**
   * @return the singleton instance of this class
   */
  public static getInstance(): Creator {
    if (Creator.instance === undefined) {
      Creator.instance = new Creator();
    }

    return Creator.instance;
  }

  private constructor() {
    super(new JQW('<div id="creator"></div>'));

    // initialize the song manager for the song creation
    SongManager.getInstance().newSong(KeyBoardType.STANDARD);
    SongManager.getSong().addPack();
    SongManager.getInstance().setSoundPack(0);

    // initialize the keyboards
    this.square = new SquareKeyboard();
    this.mapTo = new MapToKeyboard(KeyBoardType.STANDARD);

    // add the file gui
    this.asElement().append(FileGUI.getInstance().asElement());

    // add the sound inspector
    this.asElement().append(Toolbar.getInstance().asElement());

    // set the main content container
    this.main_content = new JQW('<div style="position: absolute; display: inline-block; overflow: hidden;"></div>');
    this.asElement().append(this.main_content);

    this.main_content.append(this.square.getElement());
    this.main_content.append(this.mapTo.getElement());

    // layout the elements
    this.layoutElements();

    // mouse listeners
    this.mouseDown = false;
    this.main_content.mousedown((event: JQueryMouseEventObject) => {
      this.mouseDown = true;
      DragSelector.getInstance().setStartPoint(
        event.pageX - this.main_content.offset().left,
        event.pageY - this.main_content.offset().top
      );
    });
    this.main_content.mousemove((event: JQueryMouseEventObject) => {
      if (this.mouseDown) {
        if (MousePayload.hasPayload()) {
          this.mouseDown = false;
          DragSelector.getInstance().setEndPoints();
        } else {
          DragSelector.getInstance().updateEndPoint(
            event.pageX - this.main_content.offset().left,
            event.pageY - this.main_content.offset().top
          );
        }
      }
    });
    this.main_content.mouseup(() => {
      this.mouseDown = false;
      DragSelector.getInstance().setEndPoints();
    });
    this.main_content.mouseleave(() => {
      this.mouseDown = false;
      DragSelector.getInstance().setEndPoints();
    });
    DragSelector.getInstance().setParentOffsets(0, this.fileWidth + this.padding);
    this.main_content.append(DragSelector.getInstance().asElement());
  }

  /** should be called when a song is loaded */
  public loadedSong() {
    this.mapTo.getElement().remove();
    this.mapTo = new MapToKeyboard(SongManager.getSong().getBoardType());
    this.main_content.append(this.mapTo.getElement());

    this.updateMapToGUI(true);
  }

  /**
   * this should be called when a song/pack is loaded to update the creator gui
   */
  public updateMapToGUI(flash: boolean) {
    this.mapTo.resetGUI();
    let pack = SongManager.getCurrentPack();
    if (pack) {
      let containers = pack.getContainers();
      for (let location in containers) {
        let gridLoc = KeyboardUtils.linearToGrid(parseInt(location), this.mapTo.getKeyboard().getNumCols());
        this.mapTo.showSoundActive(this.mapTo.getKeyboard().getKey(gridLoc[0], gridLoc[1]));
        if (flash)
          this.mapTo.getKeyboard().getColorManager().releasedKey(gridLoc[0], gridLoc[1]);
      }
    }
  }

  /**
   * set the element layout
   */
  private layoutElements() {
    FileGUI.getInstance().asElement().css({'left': '0', 'top': '0', 'width': this.fileWidth + 'px', 'height': '100vh'});
    Toolbar.getInstance().asElement().css(
      {'left': (this.fileWidth + this.padding) + 'px', 'bottom': '0', 'right': '0', 'height': this.inspectorHeight + 'px'}
    );
    this.main_content.css(
      {'left': (this.fileWidth + this.padding) + 'px', 'top': '0', 'right': '0', 'bottom': (this.inspectorHeight + this.padding) + 'px'}
    );
  }

  public keyDown(key: number) {
    this.mapTo.getKeyboard().keyDown(key);

    if (MousePayload.hasPayload()) {
      DragSelector.getInstance().pressedKey(key);
    } else
      Toolbar.getInstance().keyPress(key);
  }

  public keyUp(key: number) {
    this.mapTo.getKeyboard().keyUp(key);
  }

  /**
   * should be called when a key is removed from the sound container.
   * Should probably be improved to an event driven model by the song manager
   */
  public removedKey(loc: number) {
    this.mapTo.removeKey(loc);
  }

  /** @return the map to keyboard key at the given location */
  public getKey(loc: number): KeyboardKey {
    let gridLoc = KeyboardUtils.linearToGrid(loc, this.mapTo.getKeyboard().getNumCols());
    return this.mapTo.getKeyboard().getKey(gridLoc[0], gridLoc[1]);
  }

  public getSquareKeyboard(): Keyboard {
    return this.square.getKeyboard();
  }

  public getMapToKeyboard(): Keyboard {
    return this.mapTo.getKeyboard();
  }
}
