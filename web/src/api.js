const BASE = import.meta.env.VITE_API_BASE || "http://localhost:3000";

async function j(method, path, body) {
  const res = await fetch(BASE + path, {
    method,
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) throw new Error((await res.json()).error || "Request failed");
  return res.json();
}

export const api = {
  register: (email, password) =>
    j("POST", "/auth/register", { email, password }),
  login: (email, password) => j("POST", "/auth/login", { email, password }),
  verify2fa: (email, code) => j("POST", "/auth/verify-2fa", { email, code }),
  logout: () => j("POST", "/auth/logout"),
  listChats: () => j("GET", "/api/chats"),
  createChat: (title) => j("POST", "/api/chats", { title }),
  getMessages: (chatId) => j("GET", `/api/chats/${chatId}/messages`),
  sendAndStream: (chatId, content, onToken, onDone) => {
    return fetch(BASE + `/api/chats/${chatId}/message`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ content }),
    }).then(async (res) => {
      if (!res.ok) throw new Error("Failed to send message");
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        chunk.split("\n\n").forEach((line) => {
          if (line.startsWith("data: ")) {
            const data = JSON.parse(line.slice(6));
            if (data.token) onToken?.(data.token);
            if (data.done) onDone?.();
          }
        });
      }
    });
  },
};
