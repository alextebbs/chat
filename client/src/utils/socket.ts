import { io } from "socket.io-client";

export const socket = io(import.meta.env.VITE_WS_URL as string);

export interface Message<T> {
  eventName: string;
  data: T;
  meta?: {
    error?: string;
  };
}

export function asyncEmit<Data, ReturnData>(
  message: Message<Data>
): Promise<ReturnData> {
  return new Promise((resolve, reject) => {
    const { eventName, data } = message;

    socket.emit(eventName, data);
    // console.log("⬆️ Outbound", message);

    socket.on(eventName, (result) => {
      socket.off(eventName);

      if (result?.meta?.error) {
        // console.error("⬇️ Inbound", { eventName, data: result });
        reject(result);
      } else {
        resolve(result);
        // console.log("⬇️ Inbound", { eventName, data: result });
      }
    });

    // setTimeout(
    //   () => reject({ eventName, data, meta: { error: "Timed out" } }),
    //   1000
    // );
  });
}
