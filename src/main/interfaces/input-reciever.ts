/**
 * The inpput reciever interface. It allows key events to be
 * propegated to the given object
 */
interface InputReciever {
  /**
   * called when the this element is supposed to recieve a key down event
   */
  keyDown(key: number): void;

  /**
   * called when the this element is supposed to recieve a key up event
   */
  keyUp(key: number): void;
}
