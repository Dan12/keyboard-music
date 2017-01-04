/// <reference path="./payload-keyboard.ts"/>

/**
 * the class to parent the creator gui for creating songs
 * @class Creator
 * @static
 */
class Creator extends JQElement implements InputReciever {

  private static instance: Creator;

  private main_content: JQuery;

  private fileWidth = 160;
  private inspectorHeight = 120;
  private padding = 6;

  private square: PayloadKeyboard;
  private mapTo: Keyboard;

  private song: Song;

  private testLayoutSounds: {[location: number]: SoundFile};

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
    super($('<div id="creator"></div>'));

    // initialize the keyboards

    this.square = new PayloadKeyboard(KeyBoardType.SQUARE);
    this.square.getKeyboard().resize(0.6);
    this.square.getKeyboard().centerVertical();
    // add some spacing to the square
    this.square.asElement().css({'margin-right': '30px'});
    this.square.setAddSoundCallback(
      (r: number, c: number, sound: SoundFile) => {
        this.addSquareSound(r, c, sound);
      }
    );
    // turn square green when active
    this.square.getKeyboard().getColorManager().setRoutine( ColorManager.standardColorRoutine(100, 255, 100));

    this.song = new Song();
    this.testLayoutSounds = {};

    this.mapTo = new Keyboard(KeyBoardType.STANDARD);
    this.mapTo.resize(0.6);
    this.mapTo.centerVertical();

    // add the file gui
    this.asElement().append(FileGUI.getInstance().asElement());

    // add the sound inspector
    this.asElement().append(FileInspector.getInstance().asElement());

    // set the main content container
    this.main_content = $('<div style="position: absolute; display: inline-block; overflow: hidden;"></div>');
    this.asElement().append(this.main_content);

    this.main_content.append(this.square.asElement());

    // add the keyboards to the columns
    let h = $('<div class="horizontal-column"></div>');
    this.main_content.append(h);
    h.append(this.mapTo.asElement());

    // layout the elements
    this.layoutElements();
  }

  private addSquareSound(r: number, c: number, sound: SoundFile) {
    this.square.getKeyboard().getColorManager().pressedKey(r, c);

    this.testLayoutSounds[KeyboardUtils.gridToLinear(r, c, 8)] = sound;
  }

  // set the element layout
  private layoutElements() {
    FileGUI.getInstance().asElement().css({'left': '0', 'top': '0', 'width': this.fileWidth + 'px', 'height': '100vh'});
    FileInspector.getInstance().asElement().css(
      {'left': (this.fileWidth + this.padding) + 'px', 'bottom': '0', 'right': '0', 'height': this.inspectorHeight + 'px'}
    );
    this.main_content.css(
      {'left': (this.fileWidth + this.padding) + 'px', 'top': '0', 'right': '0', 'bottom': (this.inspectorHeight + this.padding) + 'px'}
    );
  }

  public keyDown(key: number) {
    this.mapTo.keyDown(key);
  }

  public keyUp(key: number) {
    this.mapTo.keyUp(key);
  }
}
