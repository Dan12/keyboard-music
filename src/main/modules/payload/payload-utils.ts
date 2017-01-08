enum PayloadHookRequest {
  CAN_RECEIVE, // hook for can receive method
  RECEIVED, // hook for receive payload method
  IS_PAYLOAD, // hook for can be payload method
};

interface PayloadHookFunc<T> {
  (type: PayloadHookRequest, payload?: Payload, objData?: T): boolean;
};
