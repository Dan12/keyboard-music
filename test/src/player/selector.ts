interface Selectable {
  select(): void;
  deselect(): void;
}

class Selector<T extends Selectable> {
  private selected: T[];

  public constructor() {
    this.selected = [];
  }

  public singleSelect(t: T) {
    this.deselect();
    this.selected = [t];
    t.select();
  }

  public deselect() {
    for (let s of this.selected) {
      s.deselect();
    }
  }

  public getSelected() {
    return this.selected;
  }
}