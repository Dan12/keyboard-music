class DragMultiPayload extends MultiPayload {

  private keys: KeyboardKey[];
  private firstKey: KeyboardKey;

  private startedMotion: boolean;
  private hadFirstPop: boolean;
  private appended: boolean;

  private offsetX: number;
  private offsetY: number;

  private lastX: number;
  private lastY: number;

  private nextIndex: number;
  private mouseOffsets: {x: number, y: number}[];

  constructor(keys: KeyboardKey[]) {
    super(new JQW('<div></div>'));

    this.keys = keys;

    this.startedMotion = false;
    this.hadFirstPop = false;
    this.appended = false;

    this.nextIndex = -1;

    this.mouseOffsets = [];
  }

  public firstPop(): boolean {
    if (this.hadFirstPop) {
      return false;
    } else {
      this.hadFirstPop = true;
      return true;
    }
  }

  public setPayload(payload: Payload, e: JQueryMouseEventObject, append_to_element: JQW): boolean {
    for (let i = 0; i < this.keys.length; i++) {
      if (this.keys[i] === payload) {
        this.setCSS();
        this.firstKey = <KeyboardKey> payload;
        // MAYBE?
        this.keys.splice(i, 1);
        this.setupPayloadMotion(e, append_to_element);
        return true;
      }
    }

    return false;
  }

  private setCSS() {
    let firstDims = this.keys[0].asElement().getDomObj().getBoundingClientRect();
    let lastDims = this.keys[this.keys.length - 1].asElement().getDomObj().getBoundingClientRect();
    let margin = parseInt(this.keys[0].asElement().css('margin'));

    this.asElement().css({
      'pointer-events': 'none',
      'display': 'inline-block',
      'position': 'absolute',
      'top': (firstDims.top - margin) + 'px',
      'left': (firstDims.left - margin) + 'px',
      'width': Math.ceil(lastDims.right + 2 * margin - firstDims.left) + 'px',
      'height': Math.ceil(lastDims.bottom + 2 * margin - firstDims.top) + 'px',
    });

    for (let i = 0; i < this.keys.length; i++) {
      let clone = this.keys[i].asElement().clone();
      clone.css({'opacity': '0.5', 'pointer-events': 'none'});
      this.asElement().append(clone);
    }
  }

  public isPayload(): boolean {
    return this.startedMotion;
  }

  public clearPayload() {
    for (let i = 0; i < this.keys.length; i++) {
      this.keys[i].unHighlight();
    }
    if (this.firstKey !== undefined)
      this.firstKey.unHighlight();
    this.startedMotion = false;

    this.asElement().remove();
  }

  private setupPayloadMotion(e: JQueryMouseEventObject, append_to_element: JQW) {
    this.startedMotion = true;

    append_to_element.append(this.asElement());

    this.offsetX = this.asElement().offset().left - e.pageX;
    this.offsetY = this.asElement().offset().top - e.pageY;

    for (let i = 0; i < this.keys.length; i++) {
      let keyDim = this.keys[i].asElement().getDomObj().getBoundingClientRect();
      this.mouseOffsets.push({x: ((keyDim.left + keyDim.right) / 2 - e.pageX), y: ((keyDim.top + keyDim.bottom) / 2 - e.pageY)});
    }
  }

  public peekPayload(): Payload {
    return this.firstKey;
  }

  public popNextPayload(): Payload {
    if (this.nextIndex === -1) {
      this.fireNextPopEvent();
      return this.firstKey;
    } else {
      let ind = this.nextIndex;
      this.fireNextPopEvent();
      return this.keys[ind];
    }
  }

  private fireNextPopEvent() {
    // go to the next valid index
    this.nextIndex++;
    while (this.nextIndex < this.keys.length && PayloadAlias.getInstance().getSquareKey(this.keys[this.nextIndex]) === undefined) {
      this.nextIndex++;
    }
    // if the next index is in range, fire an event for that index
    if (this.nextIndex < this.keys.length) {
      let event = $.Event('mouseup');
      event.pageX = this.lastX + this.mouseOffsets[this.nextIndex].x;
      event.pageY = this.lastY + this.mouseOffsets[this.nextIndex].y;
      $(document.elementFromPoint(event.pageX, event.pageY)).trigger(event);
    }
  }

  public mouseMove(e: JQueryMouseEventObject) {
    if (this.startedMotion) {

      // console.log(this.mouseOffsets);
      for (let i = 0; i < this.mouseOffsets.length; i++) {
        let event = $.Event('mouseenter');
        event.pageX = e.pageX + this.mouseOffsets[i].x;
        event.pageY = e.pageY + this.mouseOffsets[i].y;
        // console.log($(document.elementFromPoint(event.pageX, event.pageY)));
        // $(document.elementFromPoint(event.pageX, event.pageY)).trigger(event);
      }

      this.lastX = e.pageX;
      this.lastY = e.pageY;

      this.asElement().css({'top': (e.pageY + this.offsetY), 'left': (e.pageX + this.offsetX) + 'px'});
    }
  }
}
