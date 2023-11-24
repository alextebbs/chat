import {
  createAsyncThunk,
  createSlice,
  createEntityAdapter,
} from "@reduxjs/toolkit";
import { RootState } from ".";
import { Message, asyncEmit } from "../utils/socket";

export interface ChatMessage {
  id: string;
  content: string;
  user: string;
  error?: string;
}

export const getChatMessage = createAsyncThunk(
  "chat/getChatMessages",
  async (thunkAPI) => {
    const result = await asyncEmit<null, ChatMessage[]>({
      eventName: "getChatMessages",
      data: null,
    });
    return result;
  }
);

export const sendChatMessage = createAsyncThunk(
  "chat/sendChatMessage",
  async (message: ChatMessage, thunkAPI) => {
    try {
      const result = await asyncEmit<ChatMessage, Message<ChatMessage>>({
        eventName: "sendChatMessage",
        data: message,
      });
      return result.data;
    } catch (error: unknown) {
      // How am I supposed to do this properly? This is nuts.
      message.error = (error as Message<ChatMessage>).meta?.error;
      return thunkAPI.rejectWithValue(message);
    }
  }
);

interface ChatState {
  loading: "idle" | "pending" | "succeeded" | "failed";
}

const initialState = {
  loading: "idle",
} as ChatState;

const chatAdapter = createEntityAdapter<ChatMessage>();

// Then, handle actions in your reducers:
export const chatSlice = createSlice({
  name: "chat",
  initialState: chatAdapter.getInitialState(initialState),
  reducers: {
    addMessage: chatAdapter.upsertOne,
  },
  extraReducers: (builder) => {
    builder.addCase(getChatMessage.fulfilled, chatAdapter.setAll);
    builder.addCase(sendChatMessage.fulfilled, chatAdapter.upsertOne);
    builder.addCase(sendChatMessage.rejected, (state, action) => {
      chatAdapter.upsertOne(state, action.payload as ChatMessage);
    });
  },
});

export const { selectAll: selectAllChatMessages } = chatAdapter.getSelectors(
  (state: RootState) => state.chat
);

export const { addMessage } = chatSlice.actions;
