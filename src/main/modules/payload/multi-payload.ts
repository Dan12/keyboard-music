abstract class MultiPayload extends DomElement {

  /** called with the intended payload to set and the mouse event. Return true if the given payload is part of the multi payload */
  abstract setPayload(payload: Payload, e: JQueryMouseEventObject, append_to_element: JQW): boolean;

  /** pop off the next payload. The first one should be the one intended for the current mouse position */
  abstract popNextPayload(): Payload;

  /** get the first payload just to determine payload type. Multi Payloads should not be a mixed set */
  abstract peekPayload(): Payload;

  /** act on jquery mousemove event */
  abstract mouseMove(e: JQueryMouseEventObject): void;

  /** called when clearing this payload */
  abstract clearPayload(): void;

  abstract firstPop(): boolean;
}
