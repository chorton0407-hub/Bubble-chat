import React, { useEffect, useState } from "react";
import { api } from "../api";
import ChatBubble from "../components/ChatBubble.jsx";

export default function Chat({ onLogout, chatId, setChatId }) {
  const [chats, setChats] = useState([]);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);

  async function refreshChats() {
    setChats(await api.listChats());
  }
  async function openChat(id) {
    setChatId(id);
    setMessages(await api.getMessages(id));
  }
  async function newChat() {
    const c = await api.createChat("New chat");
    await refreshChats();
    openChat(c.id);
  }

  useEffect(() => {
    refreshChats();
  }, []);
  useEffect(() => {
    if (chats.length && !chatId) openChat(chats[0].id);
  }, [chats]);

  async function send() {
    if (!input.trim() || !chatId) return;
    const userMsg = { role: "user", content: input };
    setMessages((m) => [...m, { id: crypto.randomUUID(), ...userMsg }]);
    setInput("");
    setStreaming(true);
    let acc = "";
    await api.sendAndStream(
      chatId,
      userMsg.content,
      (tok) => {
        acc += tok; // accumulate assistant text
        const temp = { id: "temp", role: "assistant", content: acc };
        setMessages((m) => [...m.filter((x) => x.id !== "temp"), temp]);
      },
      () => setStreaming(false)
    );
  }

  return (
    <div style={{ display: "grid", gridTemplateColumns: "240px 1fr", gap: 16 }}>
      <aside>
        <button onClick={newChat}>+ New chat</button>
        <ul>
          {chats.map((c) => (
            <li key={c.id}>
              <button onClick={() => openChat(c.id)}>{c.title}</button>
            </li>
          ))}
        </ul>
        <button
          onClick={async () => {
            await api.logout();
            onLogout?.();
          }}
        >
          Logout
        </button>
      </aside>
      <main>
        <div style={{ minHeight: 400, border: "1px solid #ddd", padding: 12 }}>
          {messages.map((m) => (
            <ChatBubble key={m.id} role={m.role} content={m.content} />
          ))}
        </div>
        <div style={{ marginTop: 8 }}>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask your bot..."
            style={{ width: "80%" }}
          />
          <button onClick={send} disabled={streaming}>
            Send
          </button>
        </div>
      </main>
    </div>
  );
}
