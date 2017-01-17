abstract class MultiPayload extends DomElement {

  /** called with the intended payload to set and the mouse event. Return true if the given payload is part of the multi payload */
  abstract setPayload(payload: Payload, e: JQueryMouseEventObject, append_to_element: JQW): boolean;

  /** pop off the next payload. The first one should be the one intended for the current mouse position */
  abstract popNextPayload(): Payload;

  /** act on jquery mousemove event */
  abstract mouseMove(e: JQueryMouseEventObject): void;

  /** called when clearing this payload */
  abstract clearPayload(): void;

  /** @return true if the multi has had a first mouseup */
  abstract firstPop(): boolean;

  /** @return true if the multi is a payload */
  abstract isPayload(): boolean;

  /** @return true if this multi is unloading the payload */
  abstract isUnloading(): boolean;
}
