from flask import Flask, render_template
from flask_socketio import SocketIO, emit
from flask_cors import CORS
import os
import uuid
import random
import time
import threading

app = Flask(__name__)
# app.config["SECRET_KEY"] = os.getenv("SECRET_KEY")

CORS(app, resources={r"/socket.io/*": {"origins": "*"}})

socketio = SocketIO(app, cors_allowed_origins="*")


@app.route("/")
def index():
    return render_template("./index.html")


connected_users = 0
lock = threading.Lock()


@socketio.on("connect")
def handle_connect():
    global connected_users
    with lock:
        connected_users += 1

    emit(
        "updateConnectedUsers",
        {
            "eventName": "updateConnectedUsers",
            "data": connected_users,
        },
        broadcast=True,
    )


@socketio.on("disconnect")
def handle_disconnect():
    global connected_users
    with lock:
        if connected_users > 0:
            connected_users -= 1

    emit(
        "updateConnectedUsers",
        {
            "eventName": "updateConnectedUsers",
            "data": connected_users,
        },
        broadcast=True,
    )


typing_users = {}
typing_lock = threading.Lock()


def remove_inactive_typers():
    while True:
        with typing_lock:
            current_time = time.time()
            inactive_users = [
                user
                for user, last_time in typing_users.items()
                if current_time - last_time >= 3.5
            ]
            for user in inactive_users:
                del typing_users[user]

            if inactive_users:
                emit_typing_users()

        time.sleep(0.1)


def emit_typing_users():
    socketio.emit(
        "updateTypingUsers",
        {
            "eventName": "updateTypingUsers",
            "data": list(typing_users.keys()),
        },
    )


@socketio.on("isTyping")
def handle_isTyping(user):
    with typing_lock:
        if user not in typing_users:
            typing_users[user] = time.time()
            emit_typing_users()
        else:
            typing_users[user] = time.time()


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

    with typing_lock:
        if message["user"] in typing_users:
            del typing_users[message["user"]]
            emit_typing_users()


socketio.start_background_task(target=remove_inactive_typers)

if __name__ == "__main__":
    socketio.run(app, allow_unsafe_werkzeug=True)
