import { Socket } from 'k6/ws';
import { responseCode, responseType } from './constants';
import { checkResponse, getArrayFromRequest, getCallbackId } from './socket.io';
import { uuidv4 as uuid } from 'https://jslib.k6.io/k6-utils/1.4.0/index.js';

export class SocketWrapperCallback {
  socket: Socket;
  callbackCount = 0;
  ackCallbackMap: Record<string, (data: any) => void> = {};
  connected: boolean = false;
  onConnect: (() => void) | undefined;
  eventMessageHandleMap: Record<
    string,
    (data: any, callback?: (data: any) => void) => void
  > = {};

  waitingEventMap: Record<
    string,
    (isSuccess: boolean, elapsed: number, data: any) => void
  > = {};

  constructor(socket: Socket) {
    this.socket = socket;

    socket.on(`message`, (msg) => {
      this.handleMessage(msg);
    });
  }

  setOnConnect(callback: () => void) {
    this.onConnect = callback;
  }

  handleMessage(msg: string) {
    const response = checkResponse(msg);
    const type = response.type;
    const code = response.code;

    if (type == responseType.open) {
      this.socket.send(`40`);
      return;
    }

    switch (code) {
      case responseCode.connect: {
        if (this.onConnect != null) this.onConnect();
        this.connected = true;
        break;
      }
      case responseCode.ack: {
        const msgObject = getArrayFromRequest(msg);
        const callbackId = getCallbackId(msg);
        const callback = this.ackCallbackMap[callbackId];
        if (callback != undefined) {
          delete this.ackCallbackMap[callbackId];
          callback(msgObject);
        }
        break;
      }
      case responseCode.event: {
        const msgObject = getArrayFromRequest(msg);
        const event = msgObject[0];
        const message = msgObject[1];
        const callbackId = getCallbackId(msg);
        const callback = !Number.isNaN(callbackId)
          ? (data: any) => {
              this.sendAck(callbackId, data);
            }
          : undefined;

        const eventMessageHandle = this.eventMessageHandleMap[event];
        if (eventMessageHandle != undefined) {
          eventMessageHandle(message, callback);
        } else {
          console.debug(`no eventMessageHandle:`, event);
        }
        break;
      }
    }
  }

  setEventMessageHandle(
    event: string,
    handler: (message: any, callback?: (data: any) => void) => void,
  ) {
    this.eventMessageHandleMap[event] = handler;
  }

  listen(
    event: string,
    timeout: number,
    handler: (
      isSuccess: boolean,
      elapsed: number,
      data: any,
      callback?: (data: any) => void,
    ) => void,
  ) {
    const startTime = Date.now();

    const waitingEventId = uuid();

    const eventMessageHandle = (data: any, callback?: (data: any) => void) => {
      const elapsed = Date.now() - startTime;
      const isSuccess = elapsed < timeout;
      delete this.waitingEventMap[waitingEventId];
      handler(isSuccess, elapsed, data, callback);
    };

    this.waitingEventMap[waitingEventId] = handler;

    this.eventMessageHandleMap[event] = eventMessageHandle;
  }

  send(event: string, data: any, callback?: (data: any) => void) {
    if (callback == null) {
      this.socket.send(
        `${responseType.message}${
          responseCode.event
        }["${event}",${JSON.stringify(data)}]`,
      );
    } else {
      this.callbackCount++;
      this.ackCallbackMap[this.callbackCount] = callback;
      this.socket.send(
        `${responseType.message}${responseCode.event}${
          this.callbackCount
        }["${event}",${JSON.stringify(data)}]`,
      );
    }
  }

  sendWithAck(
    event: string,
    data: any,
    timeout: number,
    callback: (isSuccess: boolean, elapsed: number, data: any) => void,
  ) {
    const startTime = Date.now();

    const waitingEventId = uuid();

    this.send(event, data, (callbackData) => {
      const elapsed = Date.now() - startTime;
      const isSuccess = elapsed < timeout;
      delete this.waitingEventMap[waitingEventId];
      callback(isSuccess, elapsed, callbackData);
    });

    this.waitingEventMap[waitingEventId] = callback;
  }

  sendAck(callbackId: number, data: any) {
    this.socket.send(
      `${responseType.message}${responseCode.ack}${callbackId}[${JSON.stringify(
        data,
      )}]`,
    );
  }

  failWaitingEvents() {
    for (const waitingEvent of Object.values(this.waitingEventMap)) {
      waitingEvent(false, 0, `failed wait event.`);
    }
  }
}