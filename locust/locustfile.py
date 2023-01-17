import time
import json
from locust import task, User, events, TaskSet
import socketio


class SocketIOTasks(TaskSet):

    connection_start = None

    def on_start(self):
        print("start.")
        self.sio = socketio.Client(reconnection=False)
        self.sio.on("connect", self.on_connect)
        self.sio.on("connect_error", self.on_connect_error)
        self.sio.on("message", self.on_message)
        self.sio.on("error", self.on_error)
        self.sio.on("disconnect", self.on_disconnect)
        self.connect()

    def on_stop(self, env=None):
        print("stop.")
        self.disconnect()

    def connect(self):
        self.connection_start = time.time()
        self.sio.connect(self.user.host, transports=["websocket"])

    def disconnect(self):
        print("disconnect.")
        if self.sio.connected:
            self.sio.disconnect()

    def on_connect(self):
        print("on_connect")
        events.request.fire(
            request_type="socketio",
            name="connection",
            response_time=time.time() - self.connection_start,
            response_length=0,
            exception=None,
            context=None,
        )

    def on_connect_error(self, data):
        print("on_connect_error: " + data)
        events.request.fire(
            request_type="socketio",
            name="connection",
            response_time=time.time() - self.connection_start,
            response_length=0,
            exception="connection failed",
            context=None,
        )
        self.interrupt()

    def on_disconnect(self):
        print("on_disconnect.")
        events.request.fire(
            request_type="socketio",
            name="on_disconnect",
            response_time=time.time() - self.connection_start,
            response_length=0,
            exception="on_disconnect",
            context=None,
        )
        self.interrupt()

    def on_message(self, data):
        print("got msg: " + data)
        events.request.fire(
            request_type="socketio",
            name="message",
            response_time=1,
            response_length=0,
            context=None,
            exception=None,
        )

    def on_error(self, data):
        print("on_error")
        events.request.fire(
            request_type="socketio",
            name="error",
            response_time=1,
            response_length=0,
            exception="error",
            context=None,
        )
        self.interrupt()

    @task
    def sleep(self):
        # print("sleep")
        time.sleep(1)

    @task
    def ready(self):
        # print("ready")
        time.sleep(5)

    # @task
    # def finish(self):
    #     print("finish")
    #     self.interrupt()


class SocketIOUser(User):
    tasks = [SocketIOTasks]
