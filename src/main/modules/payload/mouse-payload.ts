/// <reference path="./payload.ts"/>
/// <reference path="./single-payload.ts"/>
/// <reference path="./payload-receiver.ts"/>
/// <reference path="./hybrid-payload.ts"/>
/// <reference path="./payload-utils.ts"/>
/// <reference path="./multi-payload.ts"/>

/**
 * Maintain the current payload of the mouse
 */
class MousePayload {
  public static CHECK_EVENT = 'mouse_payload_check';
  public static RECEIVE_EVENT = 'mouse_payload_receive';

  // the element to listen for mouse events on
  private static listen_element: JQW;

  // the current payload object, undefined if no current payload
  private static payloads: Payload[];

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

    MousePayload.listen_element.mousemove((e: JQueryMouseEventObject) => {
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
        }

        let mouseOffset = MousePayload.mouseOffsets[i];
        // move the payload clone element to the mouse position
        MousePayload.payloadElements[i].css(
          {'left': (e.pageX + MousePayload.xOffset + mouseOffset.x) + 'px', 'top': (e.pageY + MousePayload.yOffset + mouseOffset.y) + 'px'}
        );

        // fire an event over the current object with the current payload
        DomEvents.fireEvent(
          document.elementFromPoint(e.pageX + mouseOffset.x, e.pageY + mouseOffset.y),
          MousePayload.CHECK_EVENT,
          {payload: MousePayload.payloads[i]}
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

  private static popData(mx: number, my: number) {
    for (let i = 0; i < MousePayload.payloads.length; i++) {
      let mouseOffset = MousePayload.mouseOffsets[i];
      DomEvents.fireEvent(
        document.elementFromPoint(mx + mouseOffset.x, my + mouseOffset.y),
        MousePayload.RECEIVE_EVENT,
        {payload: MousePayload.payloads[i]}
      );
    }
  }

  private static clearData() {
    if (!MousePayload.setMutliples) {
      for (let i = 0; i < MousePayload.payloads.length; i++) {
        MousePayload.payloads[i].removeHighlight();
      }
      MousePayload.payloads = [];
      MousePayload.payloadElements = [];
      MousePayload.mouseOffsets = [];
    } else {
      MousePayload.setMutliples = false;
    }
  }

  private static calculateMouseOffsets(baseInd: number) {
    // TODO
  }

  /**
   * set the payload of the mouse and define some offsets
   */
  public static setPayload(payload: Payload, pageX: number, pageY: number) {
    let baseInd = -1;
    for (let i = 0; i < MousePayload.payloads.length; i++) {
      if (payload === MousePayload.payloads[i]) {
        baseInd = i;
        break;
      }
    }
    if (baseInd === -1) {
      MousePayload.setMutliples = false;
      MousePayload.clearData();
      MousePayload.payloads = [payload];
      MousePayload.mouseOffsets = [{x: 0, y: 0}];
    } else {
      MousePayload.calculateMouseOffsets(baseInd);
    }

    let offset = MousePayload.payloads[baseInd].asElement().offset();
    MousePayload.xOffset = offset.left - pageX;
    MousePayload.yOffset = offset.top - pageY;
  }

  public static addMulitplePayloads(payloads: Payload[]) {
    for (let i = 0; i < payloads.length; i++) {
      MousePayload.payloads.push(payloads[i]);
    }

    MousePayload.setMutliples = true;
  }

  public static addReceiver(receiver: PayloadReceiver<any>) {
    MousePayload.receivers.push(receiver);
  }

}
