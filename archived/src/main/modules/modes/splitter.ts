/// <reference path="../splitter/file-upload.ts"/>
/// <reference path="../splitter/analyze-audio.ts"/>

class Splitter extends DomElement {

  private static instance: Splitter;

  private currentBuffer: AudioBuffer;
  private currentArea: number[];

  public static getInstance(): Splitter {
    if (Splitter.instance === undefined) {
      Splitter.instance = new Splitter();
    }

    return Splitter.instance;
  }

  private waveform: DrawSound;

  constructor() {
    super(new JQW('<div id="splitter"></div>'));

    this.asElement().append('<h1>Splitter</h1>');
    this.asElement().append('<p>Choose an audio file to split:</p>');
    let uploader = new FileUpload((file: File) => {
      this.decodeAudioFile(file);
    });
    this.asElement().append(uploader.asElement());

    FileUpload.preventElementFileDrop(this.asElement().getDomObj());

    let saveButton = new JQW('<button id="save_button">Save Sound</button>');
    this.asElement().append(saveButton);
    saveButton.click(() => {
      let name = prompt('Sound Name:');
      let len = this.currentArea[1] - this.currentArea[0];
      let newBuffer = new ArrayBuffer(len);
      console.log(this.currentBuffer);
      for (let i = 0; i < len; i++) {
        newBuffer[i] = this.currentBuffer[i + this.currentArea[0]];
      }
      let soundStr = SoundUtils.mp3Meta64 + SoundUtils.arrayBufferToBase64(newBuffer);

      // let audioLoadedFunc = (sound: Sound) => {
      //   sound.play();
      //   console.log(sound);
      // };

      // new Sound(soundStr, {name: name, location: name, callback: audioLoadedFunc});
    });

    this.waveform = new DrawSound();
    let waveformContainer = new JQW('<div id="waveformContainer"></div>');
    this.asElement().append(waveformContainer);
    waveformContainer.append(this.waveform.asElement());
    this.waveform.asElement().hide();
  }

  private decodeAudioFile(file: File) {
    if (file.type.substring(0, file.type.indexOf('/')) === 'audio') {
      let fileReader = new FileReader();
      fileReader.onload = (event: ProgressEvent) => {
        let data = (<FileReader>event.target).result;

        // create a sound object from the data
        let soundStr = SoundUtils.mp3Meta64 + SoundUtils.arrayBufferToBase64(data);

        let audioLoadedFunc = (sound: Sound) => {
          // sound.play();
          // sound.pause();
          // console.log(sound.howl_object._sounds[0]._node);
          // console.log(sound.howl_object._sounds[0]._node.bufferSource);
          AudioTools.audioContext.decodeAudioData(data, (buffer: AudioBuffer) => {
            this.currentBuffer = buffer;
            // console.log(buffer);
            // let source = AudioTools.audioContext.createBufferSource();
            // source.buffer = buffer;
            // source.connect(AudioTools.audioContext.destination);
            // source.start(0);
            // console.log('started');
            this.waveform.asElement().show();
            this.waveform.setSound(sound, true, buffer);

            let areas = AudioAnalyzer.analyze(buffer);
            this.currentArea = areas[0];

            this.waveform.setInTime(areas[0][0] / buffer.sampleRate);
            this.waveform.setOutTime(areas[0][1] / buffer.sampleRate);
          }, () => {
            console.log('error');
          });
        };

        new Sound(soundStr, {name: 'temp', location: 'temp', callback: audioLoadedFunc});
      };
      fileReader.readAsArrayBuffer(file);

    } else {
      console.log('not valid audio file');
      console.log(file);
    }
  }

  public keyDown(key: number) {
    if (key === 32) {
      this.waveform.pressSpace();
    }
  }

  public keyUp(key: number) {
    // do nothing
  }
}
