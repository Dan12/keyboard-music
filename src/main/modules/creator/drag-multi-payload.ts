/** a class to help drag a group of sounds from the square keyboard to the map to keyboard */
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

  // flag if the mutli payload is on the square keyboard
  private square: boolean;

  constructor(keys: KeyboardKey[], square: boolean) {
    super(new JQW('<div></div>'));

    this.keys = keys;

    this.startedMotion = false;
    this.hadFirstPop = false;
    this.appended = false;

    this.nextIndex = -1;

    this.mouseOffsets = [];

    this.square = square;
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
        this.firstKey = <KeyboardKey> payload;
        this.setCSS();
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
      if (this.keys[i] === this.firstKey)
        clone.css({'opacity': '0.5', 'pointer-events': 'none'});
      else
        clone.css({'opacity': this.checkKeyMapping(this.keys[i]) ? '0.5' : '0', 'pointer-events': 'none'});
      this.asElement().append(clone);
      this.keys[i].unHighlight();
    }
  }

  public checkKeyMapping(key: KeyboardKey): boolean {
    if (this.square) {
      return PayloadAlias.getInstance().getSquareKey(key) !== undefined;
    } else {
      return PayloadAlias.getInstance().getSongKey(key) !== undefined;
    }
  }

  public deletePressed(): boolean {
    if (!this.square && !this.startedMotion) {
      for (let i = 0; i < this.keys.length; i++) {
        SongManager.getCurrentPack().removeContainer(KeyboardUtils.getKeyLocation(this.keys[i]));
        this.keys[i].unHighlight();
        this.keys[i].setDefaultColor();
      }
      return true;
    }
    return false;
  }

  public isPayload(): boolean {
    return this.startedMotion;
  }

  public isUnloading(): boolean {
    return this.nextIndex >= 0;
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
    this.lastX = e.pageX;
    this.lastY = e.pageY;

    let firstKeyDim = this.firstKey.asElement().getDomObj().getBoundingClientRect();

    for (let i = 0; i < this.keys.length; i++) {
      if (this.checkKeyMapping(this.keys[i])) {
        let keyDim = this.keys[i].asElement().getDomObj().getBoundingClientRect();
        this.mouseOffsets.push({x: (keyDim.left - firstKeyDim.left), y: (keyDim.top - firstKeyDim.top)});
      } else {
        this.mouseOffsets.push(undefined);
      }
    }
  }

  public getAllKeys(): KeyboardKey[] {
    let ret = <KeyboardKey[]>[];
    if (this.firstKey)
      ret.push(this.firstKey);
    for (let i = 0; i < this.keys.length; i++) {
      ret.push(this.keys[i]);
    }
    return ret;
  }

  public getFirstElement(): KeyboardKey {
    return this.firstKey;
  }

  public popNextPayload(): Payload {
    if (this.startedMotion) {
      if (this.nextIndex === -1) {
        return this;
      } else {
        return this.keys[this.nextIndex];
      }
    } else {
      return null;
    }
  }

  public fireNextPopEvent(): boolean {
    // go to the next valid index
    this.nextIndex++;
    // check if the next index has a sound assigned to it
    while (this.nextIndex < this.keys.length && !this.checkKeyMapping(this.keys[this.nextIndex])) {
      this.nextIndex++;
    }
    // if the next index is in range, fire an event for that index
    if (this.nextIndex < this.keys.length) {
      let event = $.Event('mouseup');
      event.pageX = this.lastX + this.mouseOffsets[this.nextIndex].x;
      event.pageY = this.lastY + this.mouseOffsets[this.nextIndex].y;
      $(document.elementFromPoint(event.pageX, event.pageY)).trigger(event);
      return true;
    } else {
      return false;
    }
  }

  public mouseMove(e: JQueryMouseEventObject) {
    if (this.startedMotion) {

      for (let i = 0; i < this.mouseOffsets.length; i++) {
        if (this.mouseOffsets[i] !== undefined) {
          let event = $.Event('mouseenter');
          event.pageX = e.pageX + this.mouseOffsets[i].x;
          event.pageY = e.pageY + this.mouseOffsets[i].y;
          // console.log($(document.elementFromPoint(event.pageX, event.pageY)));
          // $(document.elementFromPoint(event.pageX, event.pageY)).trigger(event);
        }
      }

      this.lastX = e.pageX;
      this.lastY = e.pageY;

      this.asElement().css({'top': (e.pageY + this.offsetY), 'left': (e.pageX + this.offsetX) + 'px'});
    }
  }
}
