/**
 * a class to display the data from the file mananger
 * @class FileGUI
 * @static
 */
class FileGUI extends JQElement {

  private static instance: FileGUI;

  /**
   * return the singleton instance of this class
   * @method getInstance
   * @static
   * @return {FileGUI} the instance
   */
  public static getInstance(): FileGUI {
    if (FileGUI.instance === undefined) {
      FileGUI.instance = new FileGUI();
    }

    return FileGUI.instance;
  }

  private constructor() {
    super($('<div id="file-manager"></div>'));

    // add the main directory to the file structure
    this.asElement().append($('<div id="main-directory"></div>'));
  }

  /**
   * called when the clear method is called on the
   * @method notifyClear
   */
  public notifyClear() {
    this.asElement().remove();
  }

}
