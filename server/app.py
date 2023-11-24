from flask import Flask, render_template
from flask_socketio import SocketIO, emit
from flask_cors import CORS
import os
import time
import random
import uuid

app = Flask(__name__)
app.config["SECRET_KEY"] = os.getenv("SECRET_KEY")

CORS(app, resources={r"/socket.io/*": {"origins": os.getenv("CORS_ALLOWED_ORIGINS")}})

socketio = SocketIO(app, cors_allowed_origins=os.getenv("CORS_ALLOWED_ORIGINS"))


@socketio.on("getChatMessages")
def handle_getMessages(message):
    emit(
        "getChatMessages",
        [
            {
                "id": "0001",
                "content": "This is my example chat room.",
                "user": "Alex Tebbs",
            },
            {
                "id": "0002",
                "content": "It uses React, Redux, Socket.io, and Flask.",
                "user": "Alex Tebbs",
            },
            {
                "id": "0003",
                "content": "To get these initial chats, the client sends a message event to the server, which responds with a list of chats.",
                "user": "Alex Tebbs",
            },
            {
                "id": "0004",
                "content": "The list is static right now, but could be dynamically generated from a database.",
                "user": "Alex Tebbs",
            },
            {
                "id": "0005",
                "content": "The client-side code to get the list looks something like this:",
                "user": "Alex Tebbs",
            },
            {
                "id": "0006",
                "content": '`const result = await asyncEmit("getChatMessages", null);`',
                "user": "Alex Tebbs",
            },
            {
                "id": "0007",
                "content": "The server can also respond with its own messages, and will broadcast messages from other users to all connected clients.",
                "user": "Alex Tebbs",
            },
            {
                "id": "0008",
                "content": "Half of the time you send a message, the server wont re-broadcast your message, and will respond with an error. This is to demonstrate an example of error-handling on the client-side.",
                "user": "Alex Tebbs",
            },
            {
                "id": "0009",
                "content": "If you send a message that says 'Hello Server', the server will respond with a message that says 'Hello <your name>'.",
                "user": "Alex Tebbs",
            },
        ],
    )


@socketio.on("sendChatMessage")
def handle_sendMessage(message):
    if random.random() < 0.5:
        emit(
            "sendChatMessage",
            {
                "eventName": "sendChatMessage",
                "data": None,
                "meta": {"error": "Server error occurred"},
            },
        )

    else:
        emit(
            "sendChatMessage",
            message,
        )
        emit("recieveChatMessage", message, broadcast=True)

    if message["content"] == "Hello Server":
        emit(
            "recieveChatMessage",
            {
                "id": str(uuid.uuid4()),
                "content": "Hello %s" % message["user"],
                "user": "The Flask Server",
            },
            broadcast=True,
        )


if __name__ == "__main__":
    socketio.run(app)
