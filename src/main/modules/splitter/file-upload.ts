class FileUpload extends DomElement {

  constructor(callback: (data: any) => void) {
    super(new JQW('<div id="file_upload"></div>'));

    let upload = new JQW('<input type="file" />');
    let submit = new JQW('<input type="submit" value="Submit Sound"/>');
    submit.click(() => {
      for (let i = 0; i < upload.getDomObj().files.length; i++) {
        callback(upload.getDomObj().files[i]);
      }
      upload.getDomObj().value = '';
    });
    this.asElement().append(upload);
    this.asElement().append(submit);
    let dropZone = new JQW('<div id="drop_zone">Or Drop a file here</div>');
    this.asElement().append(dropZone);

    // ========== setup file drag and drop events ===============
    DomEvents.addListener('dragover', (event: Event) => {
      dropZone.css({'background-color': 'rgba(100,255,255, 0.5)'});
      event.preventDefault();
    }, dropZone.getDomObj());
    DomEvents.addListener('dragenter', (event: Event) => {
      event.preventDefault();
    }, dropZone.getDomObj());
    DomEvents.addListener('dragleave', (event: Event) => {
      dropZone.css({'background-color': ''});
      event.preventDefault();
    }, dropZone.getDomObj());

    DomEvents.addListener('drop', (event: DragEvent) => {
      dropZone.css({'background-color': ''});
      event.preventDefault();
      // If dropped items aren't files, reject them
      let dt = event.dataTransfer;
      if (dt.items) {
        // Use DataTransferItemList interface to access the file(s)
        for (let i = 0; i < dt.items.length; i++) {
          if (dt.items[i].kind === 'file') {
            callback(dt.items[i].getAsFile());
          }
        }
      } else {
        // Use DataTransfer interface to access the file(s)
        for (let i = 0; i < dt.files.length; i++) {
          callback(dt.files[i]);
        }
      }
    }, dropZone.getDomObj());
    // ========== end file drag and drop event setup ===============
  }

  /** prevent the default file drop/open on the given element */
  public static preventElementFileDrop(elem: HTMLElement) {
    DomEvents.addListener('dragenter', (event: Event) => {
      event.preventDefault();
    }, elem);
    DomEvents.addListener('dragover', (event: Event) => {
      event.preventDefault();
    }, elem);
    DomEvents.addListener('drop', (event: Event) => {
      event.preventDefault();
    }, elem);
  }
}
