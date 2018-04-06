/**
 * the enum for the three payload hook requests
 */
enum PayloadHookRequest {
  CAN_RECEIVE, // hook for can receive method
  RECEIVED, // hook for receive payload method
  IS_PAYLOAD, // hook for can be payload method
};

/**
 * the interface definintion for the payload hook function
 */
interface PayloadHookFunc<T> {
  (type: PayloadHookRequest, payload?: Payload, objData?: T): boolean;
};
