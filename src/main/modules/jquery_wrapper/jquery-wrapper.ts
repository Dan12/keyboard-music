/**
 * provide a jQuery wrapper.
 * TODO replace jquery functions with dom manipulation
 */
class JQW {

  private jqObject: JQuery;

  private domObject: HTMLElement;

  constructor(obj: string) {
    this.jqObject = $(obj);
  }

  public getJQ(): JQuery {
    return this.jqObject;
  }

  public append(other: JQW | string) {
    if (other instanceof JQW) {
      this.jqObject.append((<JQW> other).jqObject);
    } else {
      this.jqObject.append(other);
    }
  }

  public css(prop: any, value?: any): any {
    if (value === undefined) {
      return this.jqObject.css(prop);
    } else {
      return this.jqObject.css(prop, value);
    }
  }

  public clone(): JQW {
    let ret = new JQW('');
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

  public empty() {
    this.jqObject.empty();
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

  public hasClass(name: string): boolean {
    return this.jqObject.hasClass(name);
  }

  public hide(time?: number) {
    this.jqObject.hide(time);
  }

  public show(time?: number) {
    this.jqObject.show(time);
  }

  public click(callback?: (e: any) => any) {
    if (callback === undefined) {
      this.jqObject.click();
    } else {
      this.jqObject.click(callback);
    }
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
