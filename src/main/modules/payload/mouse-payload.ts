/// <reference path="./payload.ts"/>
/// <reference path="./single-payload.ts"/>
/// <reference path="./payload-receiver.ts"/>
/// <reference path="./hybrid-payload.ts"/>
/// <reference path="./payload-utils.ts"/>

/**
 * Maintain the current payload of the mouse
 */
class MousePayload {
  public static CHECK_EVENT = 'mouse_payload_check';
  public static RECEIVE_EVENT = 'mouse_payload_receive';
  public static FINISHED_POPPING_EVENT = 'mouse_payload_finished_popping';

  // the element to listen for mouse events on
  private static listen_element: JQW;

  // the current payload object, undefined if no current payload
  private static payloads: Payload[];
  private static tempPayloads: Payload[];

  // the current payload element to bind to the mouse position, undefined if no current payload
  private static payloadElements: JQW[];

  private static mouseOffsets: {x: number, y: number}[];

  private static receivers: PayloadReceiver<any>[];

  private static setMutliples: boolean;

  // keep track of the payload x and y offsets from the mouse to provide seemless animation
  private static xOffset: number;
  private static yOffset: number;

  /**
   * initialize the mouse payload object
   */
  public static initialize(element: JQW) {
    MousePayload.listen_element = element;

    MousePayload.setMutliples = false;
    MousePayload.payloads = [];
    MousePayload.payloadElements = [];
    MousePayload.mouseOffsets = [];
    MousePayload.receivers = [];
    MousePayload.tempPayloads = [];

    MousePayload.listen_element.mousemove((e: JQueryMouseEventObject) => {
      MousePayload.assertChecks();
      // reset the receiver array
      for (let i = 0; i < MousePayload.receivers.length; i++) {
        MousePayload.receivers[i].removeReceiveHighlight();
      }
      MousePayload.receivers = [];

      for (let i = 0; i < MousePayload.payloads.length; i++) {
        // TODO maybe define some small sensitivity for the mouse movement to create the payload and execute the following code

        // set up the payload element if not already created
        if (MousePayload.payloadElements[i] === undefined) {
          MousePayload.payloadElements[i] = MousePayload.payloads[i].asElement().clone();
          MousePayload.listen_element.append(MousePayload.payloadElements[i]);
          MousePayload.payloadElements[i].css({'position': 'absolute', 'pointer-events': 'none', 'opacity': '0.5'});
          MousePayload.payloads[i].highlight();
        }

        let mouseOffset = MousePayload.mouseOffsets[i];
        // move the payload clone element to the mouse position
        MousePayload.payloadElements[i].css(
          {'left': (e.pageX + MousePayload.xOffset + mouseOffset.x) + 'px', 'top': (e.pageY + MousePayload.yOffset + mouseOffset.y) + 'px'}
        );

        // fire an event over the current object with the current payload
        DomEvents.fireEvent(
          MousePayload.CHECK_EVENT,
          {payload: MousePayload.payloads[i]},
          document.elementFromPoint(e.pageX + mouseOffset.x, e.pageY + mouseOffset.y)
        );
      }

      // prevent highlight/selecting on dragging
      e.preventDefault();
      return false;
    });

    MousePayload.listen_element.mouseup((e: JQueryMouseEventObject) => {
      MousePayload.popData(e.pageX, e.pageY);
      MousePayload.clearData();
    });
  }

  private static assertChecks() {
    if (MousePayload.payloads.length !== MousePayload.mouseOffsets.length)
      collectErrorMessage('Payload length does not match mouse offsets');
    if (MousePayload.payloads.length < MousePayload.payloadElements.length)
      collectErrorMessage('payload elements is too long');
  }

  private static popData(mx: number, my: number) {
    for (let j = 0; j < MousePayload.receivers.length; j++) {
      MousePayload.receivers[j].removeReceiveHighlight();
    }

    let len = MousePayload.payloads.length;
    for (let i = 0; i < len; i++) {
      let mouseOffset = MousePayload.mouseOffsets.pop();
      let payload = MousePayload.payloads.pop();
      payload.removeHighlight();
      let element = MousePayload.payloadElements.pop();
      if (element)
        element.remove();

      DomEvents.fireEvent(
        MousePayload.RECEIVE_EVENT,
        {payload: payload},
        document.elementFromPoint(mx + mouseOffset.x, my + mouseOffset.y)
      );
    }

    MousePayload.receivers = [];

    DomEvents.fireEvent(MousePayload.FINISHED_POPPING_EVENT);
  }

  public static hasPayload(): boolean {
    return MousePayload.payloads.length > 0;
  }

  public static hasTempPayload(): boolean {
    return MousePayload.tempPayloads.length > 0;
  }

  public static clearData() {
    if (!MousePayload.setMutliples) {
      for (let i = 0; i < MousePayload.receivers.length; i++) {
        MousePayload.receivers[i].removeReceiveHighlight();
      }
      MousePayload.receivers = [];

      for (let i = 0; i < MousePayload.payloads.length; i++) {
        MousePayload.payloads[i].removeHighlight();
        if (i < MousePayload.payloadElements.length)
          MousePayload.payloadElements[i].remove();
      }
      MousePayload.payloads = [];

      for (let i = 0; i < MousePayload.tempPayloads.length; i++) {
        MousePayload.tempPayloads[i].removeHighlight();
      }
      MousePayload.tempPayloads = [];

      for (let i = 0; i < MousePayload.payloadElements.length; i++) {
        MousePayload.payloadElements[i].remove();
      }
      MousePayload.payloadElements = [];

      MousePayload.mouseOffsets = [];
    } else {
      MousePayload.setMutliples = false;
    }
  }

  private static calculateMouseOffsets(baseInd: number) {
    let baseDim = this.payloads[baseInd].asElement().getDomObj().getBoundingClientRect();

    for (let i = 0; i < this.payloads.length; i++) {
      let curDim = this.payloads[i].asElement().getDomObj().getBoundingClientRect();
      this.mouseOffsets.push({x: (curDim.left - baseDim.left), y: (curDim.top - baseDim.top)});
    }
  }

  /**
   * set the payload of the mouse and define some offsets
   */
  public static setPayload(payload: Payload, pageX: number, pageY: number) {
    let baseInd = -1;
    for (let i = 0; i < MousePayload.tempPayloads.length; i++) {
      if (payload === MousePayload.tempPayloads[i]) {
        baseInd = i;
        break;
      }
    }

    if (baseInd === -1) {
      MousePayload.clearData();
      MousePayload.payloads = [payload];
      MousePayload.mouseOffsets = [{x: 0, y: 0}];
      baseInd = 0;
    } else {
      MousePayload.payloads = [];
      for (let i = 0; i < MousePayload.tempPayloads.length; i++) {
        if (MousePayload.tempPayloads[i].canBePayload()) {
          MousePayload.payloads.push(MousePayload.tempPayloads[i]);
        }
      }
      MousePayload.tempPayloads = [];
      MousePayload.calculateMouseOffsets(baseInd);
    }

    let offset = MousePayload.payloads[baseInd].asElement().offset();
    MousePayload.xOffset = offset.left - pageX;
    MousePayload.yOffset = offset.top - pageY;
  }

  public static addMulitplePayloads(payloads: Payload[]) {
    for (let i = 0; i < payloads.length; i++) {
      MousePayload.tempPayloads.push(payloads[i]);
    }

    MousePayload.setMutliples = true;
  }

  public static addReceiver(receiver: PayloadReceiver<any>) {
    MousePayload.receivers.push(receiver);
  }

}
