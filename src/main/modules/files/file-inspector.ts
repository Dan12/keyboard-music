class FileInspector extends JQElement {

  private static instance: FileInspector;

  public static getInstance(): FileInspector {
    if (FileInspector.instance === undefined) {
      FileInspector.instance = new FileInspector();
    }

    return FileInspector.instance;
  }

  private constructor() {
    super($('<div id="file-inspector"></div>'));

    this.asElement().append('<div id="f-name">File Name</div>');
    this.asElement().append('<canvas id="waveform">File Name</canvas>');
  }

  public inspect(name: string, sound: SoundFile) {
    $('#file-inspector #f-name').html(name);

    console.log(sound.sound._src);

    let audioCtx = new (window.AudioContext || window.webkitAudioContext)();

    console.log(audioCtx);
  }
}
