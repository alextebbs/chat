// import { useGetPokemonByNameQuery } from "./store";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { nanoid } from "nanoid";
import { useAppDispatch } from "./store";
import {
  selectAllChatMessages,
  getChatMessage,
  sendChatMessage,
} from "./store/chatSlice";

function Chat() {
  const [user, setUser] = useState("Me");
  const [content, setContent] = useState("Hello Server");
  const messages = useSelector(selectAllChatMessages);

  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(getChatMessage());
  }, [dispatch]);

  const handleSubmitForm = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!user || !content) return;

    const id = nanoid();
    dispatch(sendChatMessage({ id, user, content }));
    setContent("");
  };

  return (
    <div className="h-[100svh] flex flex-col bg-black text-white font-mono">
      <div className="flex-1 pt-2 overflow-auto">
        {messages.map((message) => (
          <div
            key={message.id}
            className="px-4 pb-1 mb-1 border-b border-neutral-900"
          >
            <span className="text-white pr-3 text-bold">{message.user}</span>
            <span className="text-neutral-400">{message.content}</span>
            {message.error && (
              <span className="pl-3 text-red-500">{message.error}</span>
            )}
          </div>
        ))}
      </div>

      <form
        className="p-4 border-t border-neutral-600 flex gap-2"
        onSubmit={handleSubmitForm}
      >
        <input
          className="bg-transparent border border-neutral-600 rounded-md px-4 py-1 text-white w-[120px]"
          type="text"
          placeholder="Name"
          onChange={(e) => setUser(e.target.value)}
          value={user}
        />
        <input
          type="text"
          className="bg-transparent border border-neutral-600 rounded-md px-4 py-1 text-white flex-1"
          placeholder="Message"
          onChange={(e) => setContent(e.target.value)}
          value={content}
        />
        <input
          className="border-blue-600 border bg-transparent rounded-md px-4 py-1 text-blue-600 hover:bg-blue-600 hover:text-white"
          type="submit"
          value="Send"
        />
      </form>
    </div>
  );
}

export default Chat;
