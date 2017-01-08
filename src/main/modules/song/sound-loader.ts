function loadSounds(urls: string[], callback: () => void) {
    let i = 0;

    let nextUrl = () => {
      i++;
      if (i >= urls.length) {
        console.log('Finished loading sounds');
        callback();
        return;
      }
      loadSoundFile(urls[i], nextUrl);
    };

    loadSoundFile(urls[i], nextUrl);
}

function loadSoundFile(url: string, callback: () => void) {
  ZipHandler.loadZip(url, callback);
}
