class FileInspector extends JQElement {

  private static instance: FileInspector;

  private audioCtx = new (window.AudioContext || window.webkitAudioContext)();

  private currentSound: Howl;

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

  public pressSpace() {
    if (this.currentSound) {
      this.currentSound.play();
    }
  }

  public inspect(name: string, sound: SoundFile) {
    $('#file-inspector #f-name').html(name);

    this.currentSound = sound.sound;

    let source = this.audioCtx.createBufferSource();

    let begin = 'data:audio/mp3;base64,';
    let raw = sound.sound._src;
    raw = raw.substring(begin.length, raw.length);

    let data = this.base64ToArrayBuffer(raw);

    this.audioCtx.decodeAudioData(data, (buffer: AudioBuffer) => {
       this.refreshCanvas(buffer.getChannelData(0), buffer.getChannelData(1));
    });
  }

  private refreshCanvas(ch1: Float32Array, ch2: Float32Array) {
    let canvas = document.getElementById('waveform');
    let ctx = canvas.getContext('2d');

    ctx.fillStyle = 'black';

    let xScale = canvas.width / ch1.length;
    let yScale = canvas.height / 4;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // draw first channel
    ctx.beginPath();
    ctx.moveTo(0, yScale);

    for (let i = 0; i < ch1.length; i++) {
      ctx.lineTo(i * xScale, (ch1[i] + 1) * yScale);
    }

    ctx.stroke();

    // draw second channel
    ctx.beginPath();
    ctx.moveTo(0, yScale * 3);

    for (let i = 0; i < ch1.length; i++) {
      ctx.lineTo(i * xScale, (ch2[i] + 3) * yScale);
    }

    ctx.stroke();
  }

  private base64ToArrayBuffer(base64: string): ArrayBuffer {
    let binaryString = window.atob(base64);
    let len = binaryString.length;
    let bytes = new Uint8Array( len );
    for (let i = 0; i < len; i++)        {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes.buffer;
  }
}
