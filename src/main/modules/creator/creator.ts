/**
 * the class to parent the creator gui for creating songs
 * @class Creator
 * @static
 */
class Creator extends JQElement {

  private static instance: Creator;

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
  }
}
