import React, { useState } from "react";
import { api } from "../api";

export default function Login({ onLoggedIn, email, setEmail }) {
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [phase, setPhase] = useState("pw");
  const [msg, setMsg] = useState("");

  async function doPw(e) {
    e.preventDefault();
    try {
      const r = await api.login(email, password);
      if (r.step === "code_sent") setPhase("code");
    } catch (e) {
      setMsg(e.message);
    }
  }

  async function doCode(e) {
    e.preventDefault();
    try {
      await api.verify2fa(email, code);
      onLoggedIn?.();
    } catch (e) {
      setMsg(e.message);
    }
  }

  return (
    <div>
      <h2>Login</h2>
      {phase === "pw" ? (
        <form onSubmit={doPw}>
          <input
            placeholder="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            placeholder="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button type="submit">Send code</button>
        </form>
      ) : (
        <form onSubmit={doCode}>
          <input
            placeholder="6‑digit code"
            value={code}
            onChange={(e) => setCode(e.target.value)}
          />
          <button type="submit">Verify & sign in</button>
        </form>
      )}
      <div>{msg}</div>
    </div>
  );
}
