import {
  AnyAction,
  Dispatch,
  MiddlewareAPI,
  configureStore,
} from "@reduxjs/toolkit";

import { useDispatch } from "react-redux";

import { addMessage, chatSlice } from "./chatSlice";
import { socket } from "../utils/socket";

const socketMiddleware = (storeAPI: MiddlewareAPI) => {
  socket.removeAllListeners();

  socket.onAny((event, data) => {
    if (data?.meta?.error) {
      console.error("⬇️ Inbound", { event, data });
    } else {
      console.log("⬇️ Inbound", { event, data });
    }
  });

  socket.onAnyOutgoing((event, data) => {
    console.log("⬆️ Outbound", { event, data });
  });

  socket.on("recieveChatMessage", function (data) {
    storeAPI.dispatch(addMessage(data));
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
    }).concat(socketMiddleware),
  devTools: process.env.NODE_ENV === "development",
});

export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;
// Export a hook that can be reused to resolve types
export const useAppDispatch: () => AppDispatch = useDispatch;
