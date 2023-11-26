import {
  createAsyncThunk,
  createSlice,
  createEntityAdapter,
  MiddlewareAPI,
  Dispatch,
  AnyAction,
} from "@reduxjs/toolkit";
import { RootState } from ".";
import { Message, asyncEmit, socket } from "../utils/socket";

export interface ChatMessage {
  id: string;
  content: string;
  user: string;
  error?: string;
}

export const getChatMessages = createAsyncThunk(
  "chat/getChatMessages",
  async () => {
    const result = await asyncEmit<ChatMessage[]>("getChatMessages");
    return result.data;
  }
);

export const sendChatMessage = createAsyncThunk(
  "chat/sendChatMessage",
  async (message: ChatMessage, thunkAPI) => {
    try {
      const result = await asyncEmit<ChatMessage, ChatMessage>(
        "sendChatMessage",
        message
      );
      return result.data;
    } catch (error: unknown) {
      console.log(error);
      // How am I supposed to do this properly? .
      message.error = (error as Message<ChatMessage>).meta?.error;
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const isTyping = (user: string) => {
  return () => {
    socket.emit("isTyping", user);
  };
};

interface ChatState {
  loading: "idle" | "pending";
  connectedUsers: number;
  typingUsers: string[];
}

const initialState = {
  loading: "idle",
  connectedUsers: 0,
  typingUsers: [],
} as ChatState;

const chatAdapter = createEntityAdapter<ChatMessage>();

// Then, handle actions in your reducers:
export const chatSlice = createSlice({
  name: "chat",
  initialState: chatAdapter.getInitialState(initialState),
  reducers: {
    addMessage: chatAdapter.upsertOne,
    updateConnectedUsers: (state, action) => {
      state.connectedUsers = action.payload;
    },
    updateTypingUsers: (state, action) => {
      state.typingUsers = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(getChatMessages.pending, (state) => {
      state.loading = "pending";
    });
    builder.addCase(getChatMessages.fulfilled, (state, action) => {
      state.loading = "idle";
      chatAdapter.setAll(state, action.payload);
    });
    builder.addCase(getChatMessages.rejected, (state) => {
      state.loading = "idle";
    });

    builder.addCase(sendChatMessage.pending, (state) => {
      state.loading = "pending";
    });
    builder.addCase(sendChatMessage.fulfilled, (state) => {
      state.loading = "idle";
    });
    builder.addCase(sendChatMessage.rejected, (state, action) => {
      state.loading = "idle";
      chatAdapter.upsertOne(state, action.payload as ChatMessage);
    });
  },
});

export const { selectAll: selectAllChatMessages } = chatAdapter.getSelectors(
  (state: RootState) => state.chat
);

export const { addMessage, updateConnectedUsers, updateTypingUsers } =
  chatSlice.actions;

export const chatMiddleware = (storeAPI: MiddlewareAPI) => {
  socket.on("sendChatMessage", function (message) {
    // error gets handled elsewhere
    if (message?.meta?.error) return;
    storeAPI.dispatch(addMessage(message.data));
  });

  socket.on("updateConnectedUsers", function (message) {
    // error gets handled elsewhere
    storeAPI.dispatch(updateConnectedUsers(message.data));
  });

  socket.on("updateTypingUsers", function (message) {
    // error gets handled elsewhere
    storeAPI.dispatch(updateTypingUsers(message.data));
  });

  return (next: Dispatch<AnyAction>) => (action: AnyAction) => {
    return next(action);
  };
};
