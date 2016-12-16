
class FileGUI extends JQElement {

  constructor() {
    super($('<div id="file-manager"></div>'));
  }

  public updateGUI(FileManager fman): void {
    this.asElement().remove('div');

    addDir(fman.files);
  }

  private addDir(Directory dir): void {
    dir.forEach(function(a, b, c) {
      console.log(a+","+b+","+c);
    });
  }

}
