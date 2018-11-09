interface Selectable {
  selected(): boolean;
  select(): void;
  deselect(): void;
}

class Selector<T extends Selectable> {
  private selected: T[];

  private multiStartX: number;
  private multiStartY: number;
  private multiEndX: number;
  private multiEndY: number;

  private x: number;
  private y: number;
  private width: number;
  private height: number;

  public readonly mutliElt: HTMLElement;

  private mutliStarted = false;

  public constructor() {
    this.selected = [];
    this.mutliElt = DomUtils.makeElt("div", {class: "multi-select"}, "");
    this.mutliElt.style.display = "none";
  }

  public singleSelect(t: T) {
    this.deselectAll();
    this.selected = [t];
    t.select();
  }

  public select(t: T) {
    if (!t.selected()) {
      this.selected.push(t);
      t.select();
    }
  }

  public deselectAll() {
    for (let s of this.selected) {
      s.deselect();
    }
    this.selected = [];
  }

  public deselect(t: T) {
    let idx = this.selected.indexOf(t);
    if (idx !== -1) {
      this.selected.splice(idx, 1);
      t.deselect();
    }
  }

  public getSelected() {
    return this.selected;
  }

  public startedMulti() {
    return this.mutliStarted;
  }

  public isContained(x: number, y: number, w: number, h: number) {
    return x >= this.x && x + w <= this.x + this.width && y >= this.y && y + h <= this.y + this.height;
  }

  public startMulti(x: number, y: number) {
    this.multiStartX = x;
    this.multiStartY = y;
    this.multiEndX = x;
    this.multiEndY = y;
    this.mutliElt.style.display = "block";

    this.setRealPosition();

    this.mutliStarted = true;
  }

  public endMulti() {
    this.mutliElt.style.display = "none";

    this.mutliStarted = false;
  }

  public updateMultiEnd(x: number, y: number) {
    this.multiEndX = x;
    this.multiEndY = y;

    this.setRealPosition();
  }

  private setRealPosition() {
    this.x = this.multiStartX < this.multiEndX ? this.multiStartX : this.multiEndX;
    this.y = this.multiStartY < this.multiEndY ? this.multiStartY : this.multiEndY;
    this.width = Math.abs(this.multiStartX - this.multiEndX);
    this.height = Math.abs(this.multiStartY - this.multiEndY);

    this.mutliElt.style.top = this.y + "px";
    this.mutliElt.style.left = this.x + "px";
    this.mutliElt.style.width = this.width + "px";
    this.mutliElt.style.height = this.height + "px";
  }
}