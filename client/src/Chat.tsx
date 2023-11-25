// import { useGetPokemonByNameQuery } from "./store";
import { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { nanoid } from "nanoid";
import { RootState, useAppDispatch } from "./store";
import {
  selectAllChatMessages,
  getChatMessages,
  sendChatMessage,
} from "./store/chatSlice";
import { getRandomName } from "./utils/getRandomUser";
import Loader from "./Loader";

function Chat() {
  const [user, setUser] = useState(getRandomName());
  const [content, setContent] = useState("");
  const messages = useSelector(selectAllChatMessages);
  const loadingState = useSelector((state: RootState) => state.chat.loading);

  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(getChatMessages());
  }, [dispatch]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  });

  const handleSubmitForm = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!user || !content) return;

    const id = nanoid();
    dispatch(sendChatMessage({ id, user, content }));
    inputRef.current?.focus();
    setContent("");
  };

  return (
    <div className="h-[100dvh] flex flex-col bg-black text-white font-mono text-xs sm:text-base overflow-hidden">
      <div className="flex-1 pt-2 overflow-auto">
        {messages.map((message) => (
          <div
            key={message.id}
            className="px-4 pb-1 mb-1 border-b border-neutral-900"
          >
            <span className="text-white pr-3 text-bold">{message.user}</span>
            <span className="text-neutral-400 pr-3">{message.content}</span>
            {message.error && (
              <span className="text-red-500">{message.error}</span>
            )}
          </div>
        ))}
        {loadingState === "pending" && (
          <div className="px-4 pt-2 pb-3 text-neutral-400">
            <Loader />
          </div>
        )}
        <div ref={scrollRef} />
      </div>

      <form
        className="p-2 sm:p-4 border-t-2 border-neutral-600 flex gap-2"
        onSubmit={handleSubmitForm}
      >
        <input
          className="bg-transparent border-2 border-neutral-600 rounded-md px-2 sm:px-4 py-1 text-white w-[70px] sm:w-[120px]"
          type="text"
          placeholder="Name"
          onChange={(e) => setUser(e.target.value)}
          value={user}
        />
        <input
          type="text"
          className="bg-transparent border-2 border-neutral-600 rounded-md px-2 sm:px-4 py-1 text-white flex-1"
          placeholder="Message"
          autoFocus
          ref={inputRef}
          onChange={(e) => setContent(e.target.value)}
          value={content}
        />
        <input
          className="border-blue-600 border-2 bg-transparent rounded-md px-2 sm:px-4 py-1 text-blue-600 hover:bg-blue-600 hover:text-white"
          type="submit"
          value="Send"
        />
      </form>
    </div>
  );
}

export default Chat;
