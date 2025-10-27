import React, { useState } from "react";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import Chat from "./pages/Chat.jsx";

export default function App() {
  const [view, setView] = useState("login");
  const [email, setEmail] = useState("");
  const [chatId, setChatId] = useState(null);

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: 24 }}>
      {view === "login" && (
        <Login
          onRegistered={() => setView("login")}
          onLoggedIn={() => setView("chat")}
          email={email}
          setEmail={setEmail}
        />
      )}
      {view === "register" && <Register onDone={() => setView("login")} />}
      {view === "chat" && (
        <Chat
          onLogout={() => setView("login")}
          chatId={chatId}
          setChatId={setChatId}
        />
      )}
      <div style={{ marginTop: 12 }}>
        {view !== "chat" && (
          <>
            <button onClick={() => setView("login")}>Login</button>
            <button
              onClick={() => setView("register")}
              style={{ marginLeft: 8 }}
            >
              Register
            </button>
          </>
        )}
      </div>
    </div>
  );
}
