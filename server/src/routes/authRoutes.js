import { Router } from "express";
function randomCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export const authRoutes = Router();

authRoutes.post("/register", async (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password)
    return res.status(400).json({ error: "email and password required" });
  const exists = await prisma.user.findUnique({ where: { email } });
  if (exists)
    return res.status(409).json({ error: "email already registered" });
  const passwordHash = await hashPassword(password);
  const user = await prisma.user.create({ data: { email, passwordHash } });

  await prisma.chat.create({ data: { userId: user.id, title: "New chat" } });
  return res.json({ ok: true });
});

authRoutes.post("/login", async (req, res) => {
  const { email, password } = req.body || {};
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return res.status(401).json({ error: "invalid credentials" });
  const valid = await verifyPassword(user.passwordHash, password || "");
  if (!valid) return res.status(401).json({ error: "invalid credentials" });

  const code = randomCode();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
  await prisma.twoFACode.create({ data: { userId: user.id, code, expiresAt } });
  try {
    await sendCode(user.email, code);
  } catch {}
  return res.json({ step: "code_sent" });
});

authRoutes.post("/verify-2fa", async (req, res) => {
  const { email, code } = req.body || {};
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return res.status(400).json({ error: "bad email/code" });
  const record = await prisma.twoFACode.findFirst({
    where: { userId: user.id, code },
    orderBy: { createdAt: "desc" },
  });
  if (!record || record.expiresAt < new Date())
    return res.status(400).json({ error: "code invalid or expired" });

  const { token, jwtId, expiresAt } = signSessionJWT(user.id);
  await prisma.session.create({ data: { userId: user.id, jwtId, expiresAt } });
  setAuthCookie(res, token);
  return res.json({ ok: true });
});

authRoutes.post("/logout", async (req, res) => {
  clearAuthCookie(res);
  return res.json({ ok: true });
});
