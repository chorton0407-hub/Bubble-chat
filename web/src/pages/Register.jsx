import React, { useState } from "react";
import { api } from "../api";

export default function Register({ onDone }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");

  async function submit(e) {
    e.preventDefault();
    try {
      await api.register(email, password);
      setMsg("Registered! You can log in now.");
      onDone?.();
    } catch (e) {
      setMsg(e.message);
    }
  }

  return (
    <form onSubmit={submit}>
      <h2>Register</h2>
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
      <button type="submit">Create account</button>
      <div>{msg}</div>
    </form>
  );
}
