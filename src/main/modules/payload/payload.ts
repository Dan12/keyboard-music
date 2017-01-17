interface Payload {
  setPayload: (payload: Payload, mouseX: number, mouseY: number) => void;
  asElement: () => JQW;
  highlight: () => void;
  removeHighlight: () => void;
}
