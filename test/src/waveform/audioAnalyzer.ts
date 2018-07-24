// Audio analyzer - upload audio file and split it into samples

class AudioAnalyzer extends DomElt {
  private idx = 0;
  private samples: Sample[] = [];

  private waveform: WaveformDisplay;
  private analyzeSections: number[][];
  private buffer: AudioBuffer;

  private nextButton: HTMLElement;
  private prevButton: HTMLElement;
  private makeSample: HTMLElement;

  constructor() {
    super("div", {"class": "analyzer"}, "");

    this.waveform = new WaveformDisplay();
    this.waveform.getElt().classList.add("hidden");

    this.nextButton = DomUtils.makeElt("button", {}, "next");
    this.prevButton = DomUtils.makeElt("button", {}, "prev");
    this.makeSample = DomUtils.makeElt("button", {}, "make sample");

    this.nextButton.addEventListener("click", () => {
      if (this.idx < this.analyzeSections.length - 1) {
        this.idx++;
        this.setTime(this.idx);
      }
    });
    this.prevButton.addEventListener("click", () => {
      if (this.idx > 0) {
        this.idx--;
        this.setTime(this.idx);
      }
    });
    this.makeSample.addEventListener("click", () => {
      const sample = new Sample(this.buffer, false, this.waveform.getInTime(), this.waveform.getOutTime());
      this.samples.push(sample);
      const player = DomUtils.makeElt("button", {}, "Play");
      player.addEventListener("click", () => {
        sample.start();
      });
      this.elt.appendChild(player);
    });

    this.nextButton.classList.add("hidden");
    this.prevButton.classList.add("hidden");
    this.makeSample.classList.add("hidden");

    this.elt.appendChild(DomUtils.makeElt("label", {}, "Anaylze File: "));
    const audioUploader = (<HTMLInputElement> DomUtils.makeElt("input", {"type": "file"}, ""));
    audioUploader.addEventListener("change", () => {
      if (audioUploader.files.length > 0) {
        this.handleFile(audioUploader.files[0]);
      }
    });
    this.elt.appendChild(audioUploader);

    // const dropZone = DomUtils.makeElt("div", {"id": "drop_zone"}, "Or drop file here");
    // this.elt.appendChild(dropZone);

    const waveformContainer = DomUtils.makeElt("div", {"id": "waveform_container"}, "");
    this.elt.appendChild(waveformContainer);
    waveformContainer.appendChild(this.waveform.getElt());

    this.elt.appendChild(this.nextButton);
    this.elt.appendChild(this.prevButton);
    this.elt.appendChild(this.makeSample);

    const spaceIO = new AnalyzeIO(this.waveform);
    KeyboardIO.instance.attachListener(spaceIO);
  }

  private handleFile(file: File) {
    AudioAnalyzer.fileToArrayBuffer(file).then((buf) => {
      return Globals.fromArray(buf);
    }).then((buf) => {
      this.buffer = buf;

      this.waveform.getElt().classList.remove("hidden");
      this.waveform.clearData();
      this.waveform.setBuffer(this.buffer);
      this.analyzeSections = Splitter.analyze(this.buffer);

      if (this.analyzeSections.length > 0) {
        this.idx = 0;
        this.setTime(this.idx);

        this.nextButton.classList.remove("hidden");
        this.prevButton.classList.remove("hidden");
        this.makeSample.classList.remove("hidden");
      }
    });
  }

  private setTime(i: number) {
    const inTime = this.analyzeSections[i][0] / this.buffer.sampleRate;
    const outTime = this.analyzeSections[i][1] / this.buffer.sampleRate;

    this.waveform.setInTime(inTime);
    this.waveform.setOutTime(outTime);
  }

  private static fileToArrayBuffer(file: File) {
    return new Promise<ArrayBuffer>((resolve, _) => {
      const fileReader = new FileReader();
      fileReader.onload = (event: FileReaderProgressEvent) => {resolve(event.target.result); };
      fileReader.readAsArrayBuffer(file);
    });
  }
}