class SongTools extends DomElement {

  private songTypeSelect: JQW;
  private songName: JQW;
  private songBPMS: JQW;

  constructor() {
    super(new JQW('<div id="song-tools" class="horizontal-column"></div>'));

    let loadButton = new JQW('<button>Load Song</button>');
    this.asElement().append(loadButton);
    loadButton.click(() => {
      SongManager.getInstance().loadSong('songs/eq.min.json', () => {
        Creator.getInstance().loadedSong();
        Toolbar.getInstance().updateSong();
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

    let nameForm = new JQW('<div><label>Name:</label></div>');
    this.asElement().append(nameForm);
    this.songName = new JQW('<input>');
    nameForm.append(this.songName);
    this.songName.focus(() => {
      InputEventPropegator.pullFocus();
    });
    this.songName.blur(() => {
      InputEventPropegator.blur();
      if (this.songName.getDomObj().value !== '')
        SongManager.getSong().setName(this.songName.getDomObj().value);
    });

    let bpmForm = new JQW('<div><label>BPM:</label></div>');
    this.asElement().append(bpmForm);
    this.songBPMS = new JQW('<input type="number" min="1" max="300">');
    bpmForm.append(this.songBPMS);
    this.songBPMS.focus(() => {
      InputEventPropegator.pullFocus();
    });
    this.songBPMS.blur(() => {
      InputEventPropegator.blur();
      if (this.songBPMS.getDomObj().value !== '')
        SongManager.getSong().setBPM(parseInt(this.songBPMS.getDomObj().value));
    });

    let ddForm = new JQW('<div><label>Keyboard Type:</label></div>');
    this.asElement().append(ddForm);
    this.songTypeSelect = new JQW(`<select>
                                    <option value="STANDARD">Standard</option>
                                    <option value="SQUARE">Square</option>
                                    <option value="DOUBLE">Double</option>
                                   </select>`);
    ddForm.append(this.songTypeSelect);
    // TODO choose keyboard type
  }

  public enterPress() {
    this.songName.blur();
    this.songBPMS.blur();
  }

  public updateSong() {
    this.songName.getDomObj().value = SongManager.getSong().getName();
    this.songBPMS.getDomObj().value = SongManager.getSong().getBPM();
  }
}
