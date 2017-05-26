/**
 * the parent class for the editor
 * @static
 */
class Editor extends DomElement {
  private static instance: Editor;

  private keyboard: Keyboard;

  /**
   * @return the singleton instance of this class
   */
  public static getInstance(): Editor {
    if (Editor.instance === undefined) {
      Editor.instance = new Editor();
    }

    return Editor.instance;
  }

  private constructor() {
    super(new JQW('<div id="editor"></div>'));

    this.keyboard = new Keyboard(KeyBoardType.STANDARD, true);
    this.asElement().append(this.keyboard.asElement());

    // this.keyboard.centerVertical();
    this.keyboard.resize(0.5);
  }

  public keyDown(key: number) {
    this.keyboard.keyDown(key);
  }

  public keyUp(key: number) {
    this.keyboard.keyUp(key);
  }
}