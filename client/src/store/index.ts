import {
  AnyAction,
  Dispatch,
  MiddlewareAPI,
  configureStore,
} from "@reduxjs/toolkit";

import { useDispatch } from "react-redux";

import { addMessage, chatMiddleware, chatSlice } from "./chatSlice";
import { Message, socket } from "../utils/socket";

const loggingMiddleware = (storeAPI: MiddlewareAPI) => {
  socket.onAny((event: string, message: Message<never>) => {
    if (message?.meta?.error) {
      console.error("⬇️ Inbound", event, message.data, message.meta.error);
    } else {
      console.log("⬇️ Inbound", event, message.data);
    }
  });

  socket.onAnyOutgoing((event, message) => {
    console.log("⬆️ Outbound", event, message);
  });

  socket.on("connect", () => {
    console.log("✅ Socket is connected");
  });

  socket.on("disconnect", () => {
    console.error("❌ Socket connection lost");
  });

  return (next: Dispatch<AnyAction>) => (action: AnyAction) => {
    return next(action);
  };
};

export const store = configureStore({
  reducer: {
    chat: chatSlice.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      immutableCheck: false,
      serializableCheck: false,
    }).concat([loggingMiddleware, chatMiddleware]),
  devTools: process.env.NODE_ENV === "development",
});

export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;
// Export a hook that can be reused to resolve types
export const useAppDispatch: () => AppDispatch = useDispatch;
