/// <reference path="./file-upload.ts"/>
/// <reference path="./analyze-audio.ts"/>

class Splitter extends DomElement {

  private static instance: Splitter;

  public static getInstance(): Splitter {
    if (Splitter.instance === undefined) {
      Splitter.instance = new Splitter();
    }

    return Splitter.instance;
  }

  constructor() {
    super(new JQW('<div id="splitter"></div>'));

    this.asElement().append('<h1>Splitter</h1>');
    this.asElement().append('<p>Choose an audio file to split:</p>');
    let uploader = new FileUpload((file: File) => {
      this.decodeAudioFile(file);
    });
    this.asElement().append(uploader.asElement());

    FileUpload.preventElementFileDrop(this.asElement().getDomObj());
  }

  private decodeAudioFile(file: File) {
    if (file.type.substring(0, file.type.indexOf('/')) === 'audio') {
      let fileReader = new FileReader();
      fileReader.onload = (event: ProgressEvent) => {
        let data = (<FileReader>event.target).result;
        AudioTools.audioContext.decodeAudioData(data, (buffer: AudioBuffer) => {
          console.log(buffer);
          let source = AudioTools.audioContext.createBufferSource();
          source.buffer = buffer;
          source.connect(AudioTools.audioContext.destination);
          source.start(0);
          console.log('started');

          AudioAnalyzer.analyze(buffer);
        }, () => {
          console.log('error');
        });
      };
      fileReader.readAsArrayBuffer(file);

    } else {
      console.log('not valid audio file');
      console.log(file);
    }
  }
}
