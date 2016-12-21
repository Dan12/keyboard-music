/**
 * the class to parent the creator gui
 * @class
 * @static
 */
class Creator extends JQElement {

  private static instance: Creator;

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
