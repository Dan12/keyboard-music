
class FileGUI extends JQElement {

  private static instance: FileGUI;

  public static getInstance(): FileGUI {
    if (FileGUI.instance === undefined) {
      FileGUI.instance = new FileGUI();
    }

    return FileGUI.instance;
  }

  private constructor() {
    super($('<div id="file-manager"></div>'));

    this.asElement().append($('<div id="main-directory"></div>'));
  }

  public notifyAdd(location: string) {
    let dirArr = location.split('/');

    let dirID = 'main-directory';

    let i = 0;
    if (location.startsWith('/'))
      i = 1;

    for (; i < dirArr.length; i++) {
      // if directory location
      if (i < dirArr.length - 1) {

        let dirDiv = $('#file-manager #' + dirID + '-' + dirArr[i]);
        // add the subdirectory
        if (dirDiv.length === 0) {
          let dirElement = $('<div subdir="' + dirID + '-' + dirArr[i] + '" class="subdirectory-name">' + dirArr[i] + '</div>');
          $('#file-manager #' + dirID).append(dirElement);
          dirElement.click(function() {
            $('#file-manager #' + dirElement.attr('subdir')).toggle(100);
          });
          $('#file-manager #' + dirID).append('<div id="' + dirID + '-' + dirArr[i] + '" class="subdirectory"></div>');
        }
      } else {
        let fileElement = $('<div path="' + location + '" class="file">' + dirArr[i] + '</div>');
        $('#file-manager #' + dirID).append(fileElement);
        fileElement.click(function() {
          // console.log(fileElement.attr('path'));
          // console.log(FileManager.getInstance());
          // FileManager.getInstance().getSound(fileElement.attr('path')).sound.play();
          FileInspector.getInstance().inspect(fileElement.attr('path'), FileManager.getInstance().getSound(fileElement.attr('path')));
        });
      }

      dirID = dirID + '-' + dirArr[i];
    }
  }

  public notifyClear() {
    this.asElement().remove();
  }

}
