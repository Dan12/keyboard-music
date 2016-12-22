/**
 * The inpput reciever interface. It allows key events to be
 * propegated to the given object
 */
interface InputReciever {
  keyDown(key: number): void;

  keyUp(key: number): void;
}
