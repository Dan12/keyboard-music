class DrawSound extends DomElement {
  private canvas: HTMLElement;
  private ctx: CanvasRenderingContext2D;

  private inTime = 0;
  private outTime = 0;
  // pixels per sample
  private scale = 0.08;
  private offset = 0;
  private padding = 20;
  // samples per second
  private sampleRate: number;

  private cursorAt = 0;

  private ch1: Float32Array;
  private ch2: Float32Array;

  private mousedown = false;

  constructor() {
    super(new JQW('<div class="waveform"></div>'));

    let canvasElement = new JQW(`<canvas id="waveform-canvas" width="10" height="10">
                                   Your Browser Does Not Support The Canvas Element
                                 </canvas>`);

    this.asElement().append(canvasElement);
    this.canvas = canvasElement.getDomObj();

    this.asElement().css({
      'overflow-x': 'hidden',
      'overflow-y': 'hidden'
    });
  }

  public initSound(ch1: Float32Array, ch2: Float32Array) {
    if (this.ctx === undefined) {
      this.canvas.width = Math.floor(this.asElement().width());
      this.canvas.height = this.asElement().height();
      this.ctx = this.canvas.getContext('2d');
    }
  }
}