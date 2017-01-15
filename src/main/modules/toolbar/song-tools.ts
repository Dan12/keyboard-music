class SongTools extends DomElement {

  constructor() {
    super(new JQW('<div id="song-tools" class="horizontal-column"></div>'));

    let loadButton = new JQW('<button>Load Song</button>');
    this.asElement().append(loadButton);
    loadButton.click(() => {
      SongManager.getInstance().loadSong('songs/eq.min.json', () => {
        Creator.getInstance().loadedSong();
      });
    });

    let saveButton = new JQW('<button>Save Song</button>');

    this.asElement().append(saveButton);
    saveButton.click(() => {
      let song = SongManager.getInstance().constructJSON();
      console.log(JSON.stringify(song));
    });

    let loadZipButton = new JQW('<button>Load Zip</button>');

    this.asElement().append(loadZipButton);
    loadZipButton.click(() => {
      // load eq.zip into the file manager
      // TODO expand to file chooser
      ZipHandler.requestZipLoad('eq.zip', () => {
        console.log('loaded eq.zip');
      });
    });

    // TODO choose keyboard type
  }
}
