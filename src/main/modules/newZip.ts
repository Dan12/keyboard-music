class NewZip {
  private static zipBase = 'songs';

  public static loadZip(name: string, callback?: () => void) {

    let zip = new JSZip();

    // get request for zip file
    let xhr = new XMLHttpRequest();
    xhr.open('GET', `${NewZip.zipBase}/${name}`);
    xhr.responseType = 'blob';
    xhr.onload = function(){
      let f = xhr.response;
      zip.loadAsync(f)
      .then(function(zip) {
          zip.forEach(function (relativePath, zipEntry) {
            if (zipEntry.name.endsWith('.mp3')) {
                let soundName = zipEntry.name;
                zipEntry.async('base64').then(function(data) {
                  let sound = new Howl({
                    urls: [data],
                    onload: function() {
                      this.play();
                    }
                  });
                });
            }
          });
        }, function (e) {
          console.log(e);
        }
      );
    };
    xhr.send();
    console.log(`Fetching sound file \"${name}\" from the server...`);
  }
}
