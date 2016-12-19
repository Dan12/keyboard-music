class NewZip {
  private static zipBase = 'songs';

  public static loadZip(name: string) {

    let zip = new JSZip();

    // get request for zip file
    let xhr = new XMLHttpRequest();
    xhr.open('GET', `${NewZip.zipBase}/${name}`);
    xhr.responseType = 'blob';
    xhr.onload = function(){
      let f = xhr.response;
      zip.loadAsync(f).then(function(zip) {
        console.log(Object.keys(zip.files).length);
        zip.forEach(function (relativePath, zipEntry) {
          if (zipEntry.name.endsWith('.mp3')) {
            zipEntry.async('base64').then(function(data) {
              data = 'data:audio/mp3;base64,' + data;

              FileManager.getInstance().addFile(zipEntry.name, data);
            });
          }
        });
      }, function (e) {
        console.log(e);
      });
    };
    xhr.send();
    console.log(`Fetching sound file \"${name}\" from the server...`);
  }
}
