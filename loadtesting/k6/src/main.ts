import ws from "k6/ws";
import { check } from "k6";
import { makeConnection } from "../libs/socket.io";
import { checkForEventMessages } from "../libs/socket.io";
import { socketResponseCode, socketResponseType } from "../libs/constants";
import { Trend } from "k6/metrics";

export const options = {
  vus: 50,
  duration: "15s",
  tags: {
    testName: "socketsio poc",
  },
};

// this trend will show up in the k6 output results
let messageTime = new Trend("socketio_message_duration_ms");

export default function (): void {
  const secure = __ENV.MY_HOSTNAME != undefined ? true : false;

  const domain = secure
    ? `react-video-call-fjutjsrlaa-uc.a.run.app`
    : `localhost:4000`;

  let startTime = 0;
  let endTime = 0;

  const sid = makeConnection(domain, secure);

  // Let's do some websockets
  const url = `${
    secure ? "wss" : "ws"
  }://${domain}/socket.io/?EIO=4&transport=websocket&sid=${sid}`;

  let response = ws.connect(url, {}, function (socket) {
    socket.on("open", function open() {
      console.log("connected");
      socket.send("2probe");
      socket.send("5");
      socket.send("3");

      // send an event message
      startTime = Date.now();
      socket.send(
        `${socketResponseType.message}${socketResponseCode.event}["chat message","hello k6"]`
      );

      // socket.setInterval(function timeout() {
      //   socket.ping();
      //   console.log('Pinging every 1sec (setInterval test)');
      // }, 1000 * 5);
    });

    // This will constantly poll for any messages received
    socket.on("message", function incoming(msg) {
      // checking for event messages
      checkForEventMessages<string[]>(msg, function (messageData) {
        endTime = Date.now();
        console.log(`
          ------------------------ 
          event=${messageData[0]}
          message=${messageData[1]}
          vu=${__VU.toString()} 
          iter=${__ITER.toString()} 
          time=${Date.now().toString()}
        `);
      });
    });

    socket.on("close", function close() {
      console.log("disconnected");
    });

    socket.on("error", function (e) {
      console.log("error", JSON.stringify(e));
      if (e.error() != "websocket: close sent") {
        console.log("An unexpected error occured: ", e.error());
      }
    });

    socket.setTimeout(function () {
      console.log("2 seconds passed, closing the socket");
      socket.close();
    }, 1000 * 2);
  });

  check(response, { "status is 101": (r) => r && r.status === 101 });

  // Log message time
  messageTime.add(endTime - startTime);
}
