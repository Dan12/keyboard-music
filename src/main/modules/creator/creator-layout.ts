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
  private mapTo: PayloadKeyboard;

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
    this.square.getKeyboard().getColorManager().setRoutine(ColorManager.standardColorRoutine(100, 255, 100));
    this.square.getKeyboard().setPressKeyListener((r: number, c: number) => {
      let sound = this.testLayoutSounds[KeyboardUtils.gridToLinear(r, c, 8)];
      if (sound)
        FileInspector.getInstance().inspectSound(sound);
    });

    // initialize the song manager for the song creation
    SongManager.getInstance().newSong();
    SongManager.getSong().addPack();
    SongManager.getInstance().setSoundPack(0);

    this.testLayoutSounds = {};

    this.mapTo = new PayloadKeyboard(KeyBoardType.STANDARD);
    this.mapTo.getKeyboard().resize(0.6);
    this.mapTo.getKeyboard().centerVertical();
    this.mapTo.setAddSoundCallback(
      (r: number, c: number, sound: SoundFile) => {
        // add the sound to the song
        SongManager.getSong().addSound(
          0,
          KeyboardUtils.gridToLinear(r, c, KeyboardUtils.getKeyboardSize(KeyBoardType.STANDARD).cols),
          sound
        );

        this.mapTo.getKeyboard().getColorManager().releasedKey(r, c);
      }
    );
    // turn square green when there is a key on it
    this.mapTo.getKeyboard().getColorManager().setRoutine(
      (r: number, c: number, p: boolean) => {
        let hasElement = SongManager.getCurrentPack().getContainer(
          KeyboardUtils.gridToLinear(r, c, KeyboardUtils.getKeyboardSize(KeyBoardType.STANDARD).cols)
        ) !== undefined;

        return [{row: r, col: c, r: p ? 255 : hasElement ? 100 : -1, g: p ? 160 : hasElement ? 255 : -1, b: p ? 0 : hasElement ? 100 : -1}];
      }
    );
    this.mapTo.getKeyboard().setPressKeyListener((r: number, c: number) => {
      console.log(`inspect ${r},${c}`);
    });

    // add the file gui
    this.asElement().append(FileGUI.getInstance().asElement());

    // add the sound inspector
    this.asElement().append(FileInspector.getInstance().asElement());

    // set the main content container
    this.main_content = $('<div style="position: absolute; display: inline-block; overflow: hidden;"></div>');
    this.asElement().append(this.main_content);

    this.main_content.append(this.square.asElement());
    this.main_content.append(this.mapTo.asElement());

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
    this.mapTo.getKeyboard().keyDown(key);
  }

  public keyUp(key: number) {
    this.mapTo.getKeyboard().keyUp(key);
  }
}
