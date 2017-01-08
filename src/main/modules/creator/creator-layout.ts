/// <reference path="./payload-keyboard.ts"/>
/// <reference path="./creator-square-keyboard.ts"/>
/// <reference path="./creator-mapto-keyboard.ts"/>
/// <reference path="./key-payload-manager.ts"/>

/**
 * the class to parent the creator gui for creating songs
 * @class Creator
 * @static
 */
class Creator extends DomElement implements InputReciever {

  private static instance: Creator;

  private main_content: JQW;

  private fileWidth = 160;
  private inspectorHeight = 120;
  private padding = 6;

  private mapTo: MapToKeyboard;
  private square: SquareKeyboard;

  /**
   * return the singleton instance of this class
   * @method getInstance
   * @static
   * @return {Creator} the instance
   */
  public static getInstance(): Creator {
    if (Creator.instance === undefined) {
      Creator.instance = new Creator();
    }

    return Creator.instance;
  }

  private constructor() {
    super(new JQW('<div id="creator"></div>'));

    // initialize the keyboards
    this.square = new SquareKeyboard();
    this.mapTo = new MapToKeyboard();

    // initialize the song manager for the song creation
    SongManager.getInstance().newSong(KeyBoardType.STANDARD);
    SongManager.getSong().addPack();
    SongManager.getInstance().setSoundPack(0);

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
  }

  public loadedSong() {
    KeyPayloadManager.getInstance().clearKeyboard(this.mapTo.getKeyboard().getID());
    let pack = SongManager.getCurrentPack();
    if (pack) {
      let containers = pack.getContainers();
      for (let container of containers) {
        let gridLoc = KeyboardUtils.linearToGrid(container[0], this.mapTo.getKeyboard().getNumCols());
        let loc = <string> container[1][0][0];
        let baseDir = loc.substring(0, loc.indexOf('/'));
        let fileLocation = loc.substring(loc.indexOf('/') + 1, loc.length);
        let sound = FileManager.getInstance().getSound(baseDir, fileLocation);
        KeyPayloadManager.getInstance().addKey(this.mapTo.getKeyboard().getID(), container[0], sound);
        this.mapTo.showSoundActive(gridLoc[0], gridLoc[1]);
      }
    }
  }

  // set the element layout
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
  }

  public keyUp(key: number) {
    this.mapTo.getKeyboard().keyUp(key);
  }
}
