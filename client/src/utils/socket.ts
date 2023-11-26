import { io } from "socket.io-client";

export const socket = io(import.meta.env.VITE_WS_URL as string);

export interface Message<T> {
  eventName: string;
  data: T;
  meta?: {
    error?: string;
  };
}

export function asyncEmit<ReturnData, Data = null>(
  eventName: string,
  data: Data | null = null
): Promise<Message<ReturnData>> {
  return new Promise((resolve, reject) => {
    socket.emit(eventName, data);

    socket.once(eventName, (result: Message<ReturnData>) => {
      if (result?.meta?.error) {
        console.log("ERROR", result);
        reject({ eventName, data, meta: { error: result.meta.error } });
      } else {
        resolve(result);
      }
    });

    setTimeout(
      () =>
        reject({
          eventName,
          data,
          meta: { error: "Request timed out after one second." },
        }),
      1500
    );
  });
}
