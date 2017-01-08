class JQueryWrapper {

  private jqObject: JQuery;

  constructor(obj: string) {
    this.jqObject = $(obj);
  }

  public append(other: JQueryWrapper | string) {
    if (other instanceof JQueryWrapper) {
      this.jqObject.append((<JQueryWrapper> other).jqObject);
    } else {
      this.jqObject.append(other);
    }
  }

  public css(prop: any, value?: any): any {
    if (value) {
      this.jqObject.css(prop, value);
    } else {
      return this.jqObject.css(prop);
    }
  }

  public clone(): JQueryWrapper {
    let ret = new JQueryWrapper('');
    ret.jqObject = this.jqObject.clone();
    return ret;
  }

  public html(text: string) {
    this.jqObject.html(text);
  }

  public height(): number {
    return this.jqObject.height();
  }

  public width(): number {
    return this.jqObject.width();
  }

  public offset(): any {
    return this.jqObject.offset();
  }

  public remove(selector?: string) {
    return this.jqObject.remove(selector);
  }

  public toggle(time?: number) {
    this.jqObject.toggle(time);
  }

  public addClass(name: string) {
    this.jqObject.addClass(name);
  }

  public removeClass(name: string) {
    this.jqObject.removeClass(name);
  }

  public hide(time?: number) {
    this.jqObject.hide(time);
  }

  public show(time?: number) {
    this.jqObject.show(time);
  }

  public click(callback: (e: any) => any) {
    this.jqObject.click(callback);
  }

  public mouseover(callback: (e: any) => any) {
    this.jqObject.mouseover(callback);
  }

  public mousemove(callback: (e: any) => any) {
    this.jqObject.mousemove(callback);
  }

  public mouseenter(callback: (e: any) => any) {
    this.jqObject.mouseenter(callback);
  }

  public mouseleave(callback: (e: any) => any) {
    this.jqObject.mouseleave(callback);
  }

  public mousedown(callback: (e: any) => any) {
    this.jqObject.mousedown(callback);
  }

  public mouseup(callback: (e: any) => any) {
    this.jqObject.mouseup(callback);
  }

  public keydown(callback: (e: any) => any) {
    this.jqObject.keydown(callback);
  }

  public keyup(callback: (e: any) => any) {
    this.jqObject.keyup(callback);
  }
}
