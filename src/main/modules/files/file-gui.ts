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
   * called by file manager when a data item is added
   * @method notifyAdd
   */
  public notifyAdd(location: string) {
    let dirArr = location.split('/');

    let dirID = 'main-directory';

    let i = 0;
    if (location.startsWith('/'))
      i = 1;

    for (; i < dirArr.length; i++) {
      // if this is a directory, append it to the correct parent directory
      if (i < dirArr.length - 1) {
        // check if this subdirectory exists
        let dirDiv = $('#file-manager #' + dirID + '-' + dirArr[i]);

        // add the subdirectory if it does not exist
        if (dirDiv.length === 0) {
          // add the subdirectory name
          let dirElement = $('<div subdir="' + dirID + '-' + dirArr[i] + '" class="subdirectory-name">' + dirArr[i] + '</div>');
          // append the subdirectory to the parent
          $('#file-manager #' + dirID).append(dirElement);
          // add a listener to the name to expand the subdirectory when clicked
          dirElement.click(function() {
            $('#file-manager #' + dirElement.attr('subdir')).toggle(100);
          });
          // add the subdirectory
          $('#file-manager #' + dirID).append('<div id="' + dirID + '-' + dirArr[i] + '" class="subdirectory"></div>');
        }
      } else {
        // append the file to the correct div
        let fileElement = $('<div path="' + location + '" class="file">' + dirArr[i] + '</div>');
        $('#file-manager #' + dirID).append(fileElement);
        // listen for a click and display the connected file in the file inspector
        fileElement.click(function() {
          FileInspector.getInstance().inspect(fileElement.attr('path'), FileManager.getInstance().getSound(fileElement.attr('path')));
        });
      }
      // create the next subdir id
      dirID = dirID + '-' + dirArr[i];
    }
  }

  /**
   * called when the clear method is called on the
   * @method notifyClear
   */
  public notifyClear() {
    this.asElement().remove();
  }

}
