/**
 * a class to display the data from the file mananger
 * @static
 */
class FileGUI extends DomElement {

  private static instance: FileGUI;

  /**
   * @return the singleton instance of this class
   */
  public static getInstance(): FileGUI {
    if (FileGUI.instance === undefined) {
      FileGUI.instance = new FileGUI();
    }

    return FileGUI.instance;
  }

  private constructor() {
    super(new JQW('<div id="file-manager"></div>'));

    // add the main directory to the file structure
    this.asElement().append(new JQW('<div id="main-directory"></div>'));
  }

  /**
   * called when the clear method is called on the
   */
  public notifyClear() {
    this.asElement().remove();
  }

}
