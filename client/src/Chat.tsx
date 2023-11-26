// import { useGetPokemonByNameQuery } from "./store";
import { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { nanoid } from "nanoid";
import { RootState, useAppDispatch } from "./store";
import {
  selectAllChatMessages,
  getChatMessages,
  sendChatMessage,
  isTyping,
} from "./store/chatSlice";
import { getRandomName } from "./utils/getRandomUser";
import Loader from "./Loader";

function formatNames(names) {
  if (names.length === 0) {
    return "";
  } else if (names.length === 1) {
    return names[0];
  } else if (names.length === 2) {
    return names.join(" and ");
  } else {
    return names.slice(0, -1).join(", ") + ", and " + names[names.length - 1];
  }
}

function Chat() {
  const [user, setUser] = useState(getRandomName());
  const [content, setContent] = useState("");
  const messages = useSelector(selectAllChatMessages);
  const loadingState = useSelector((state: RootState) => state.chat.loading);
  const connectedUsers = useSelector(
    (state: RootState) => state.chat.connectedUsers
  );
  const typingUsers = useSelector(
    (state: RootState) => state.chat.typingUsers
  ).filter((name) => name !== user);
  const [height, setHeight] = useState(visualViewport && visualViewport.height);

  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const dispatch = useAppDispatch();

  // This is all to get the UI to stay in one fucking place
  // while the mobile keyboard is doing whatever it does
  useEffect(() => {
    visualViewport &&
      visualViewport.addEventListener("resize", () => {
        window.scrollTo(0, 0);
        visualViewport && setHeight(visualViewport.height);
      });

    window.addEventListener("scroll", (e) => {
      e.preventDefault();
      window.scrollTo(0, 0);
    });
  }, []);

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
    <div
      className="flex flex-col text-white font-mono text-xs sm:text-base overflow-hidden"
      style={{ height: height || "100dvh" }}
    >
      <div className="flex-1 pt-1 overflow-auto">
        {messages.map((message) => (
          <div
            key={message.id}
            className="px-4 py-1 border-b border-neutral-900"
          >
            <span className="text-white pr-3 text-bold">{message.user}</span>
            <span className="text-neutral-400 pr-3">{message.content}</span>
            {message.error && (
              <span className="text-red-500">{message.error}</span>
            )}
          </div>
        ))}
        <div className="flex text-xs text-neutral-500 px-4 py-2">
          {typingUsers.length > 0 && (
            <div className="mr-auto">
              {formatNames(typingUsers)} {typingUsers.length > 1 ? "are" : "is"}{" "}
              typing...
            </div>
          )}

          {connectedUsers && (
            <div className="ml-auto">
              {connectedUsers > 1
                ? `There are ${connectedUsers} people here.`
                : `You're the only one here.`}
            </div>
          )}
        </div>
        {loadingState === "pending" && (
          <div className="px-4 pt-2 pb-3 text-neutral-400">
            <Loader />
          </div>
        )}
        <div ref={scrollRef} />
      </div>

      <form
        className="p-2 sm:p-4 sm:pt-2 border-t-2 border-neutral-600 flex gap-2 flex-col"
        onSubmit={handleSubmitForm}
      >
        <div className="flex gap-2">
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
            onChange={(e) => {
              dispatch(isTyping(user));
              setContent(e.target.value);
            }}
            value={content}
          />
          <input
            className="border-blue-600 border-2 bg-transparent rounded-md px-2 sm:px-4 py-1 text-blue-600 hover:bg-blue-600 hover:text-white"
            type="submit"
            value="Send"
          />
        </div>
      </form>
    </div>
  );
}

export default Chat;
