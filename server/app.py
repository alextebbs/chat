from flask import Flask, render_template
from flask_socketio import SocketIO, emit
from flask_cors import CORS
import os
import uuid
import random
import time

app = Flask(__name__)
# app.config["SECRET_KEY"] = os.getenv("SECRET_KEY")

CORS(app, resources={r"/socket.io/*": {"origins": os.getenv("CORS_ALLOWED_ORIGINS")}})

socketio = SocketIO(app, cors_allowed_origins=os.getenv("CORS_ALLOWED_ORIGINS"))


@app.route("/")
def index():
    return render_template("./index.html")


@socketio.on("connect")
def handle_connect():
    emit(
        "sendChatMessage",
        {
            "eventName": "sendChatMessage",
            "data": {
                "id": str(uuid.uuid4()),
                "content": "Someone has connected to the chat",
                "user": "The Flask Server",
            },
        },
        broadcast=True,
    )


@socketio.on("disconnect")
def handle_disconnect():
    emit(
        "sendChatMessage",
        {
            "eventName": "sendChatMessage",
            "data": {
                "id": str(uuid.uuid4()),
                "content": "Someone has left the chat.",
                "user": "The Flask Server",
            },
        },
        broadcast=True,
    )


@socketio.on("getChatMessages")
def handle_getMessages(message):
    initial_messages = []

    with open("messages.txt", "r") as file:
        id = 0

        for line in file:
            initial_messages.append(
                {"id": str(id), "content": line.strip(), "user": "The Flask Server"}
            )
            id += 1

    emit("getChatMessages", {"eventName": "getChatMessages", "data": initial_messages})


@socketio.on("sendChatMessage")
def handle_sendMessage(message):
    event_name = "sendChatMessage"

    if random.random() < 0.5 and message["user"] == "error":
        time.sleep(0.4)
        if random.random() < 0.5:
            emit(
                event_name,
                {
                    "eventName": event_name,
                    "data": None,
                    "meta": {"error": "Server error occurred. Message not broadcast."},
                },
            )
        else:
            return  # time out

    else:
        emit(
            event_name,
            {
                "eventName": event_name,
                "data": message,
            },
            broadcast=True,
        )

        if message["content"] == "Hello Server":
            emit(
                event_name,
                {
                    "eventName": event_name,
                    "data": {
                        "id": str(uuid.uuid4()),
                        "content": "Hello %s" % message["user"],
                        "user": "The Flask Server",
                    },
                },
                broadcast=True,
            )


if __name__ == "__main__":
    socketio.run(app, allow_unsafe_werkzeug=True)
