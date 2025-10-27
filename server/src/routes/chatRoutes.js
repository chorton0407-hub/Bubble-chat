import { Router } from "express";
import { prisma } from "../db.js";
import { requireAuth } from "../middleware/requireAuth.js";
import { streamOpenAIResponse } from "../openai.js";

export const chatRoutes = Router();
chatRoutes.use(requireAuth);

chatRoutes.get("/chats", async (req, res) => {
  const chats = await prisma.chat.findMany({
    where: { userId: req.userId },
    orderBy: { updatedAt: "desc" },
  });
  res.json(chats);
});

chatRoutes.get("/chats/:id/messages", async (req, res) => {
  const chat = await prisma.chat.findUnique({ where: { id: req.params.id } });
  if (!chat || chat.userId !== req.userId)
    return res.status(404).json({ error: "not found" });
  const messages = await prisma.message.findMany({
    where: { chatId: chat.id },
    orderBy: { createdAt: "asc" },
  });
  res.json(messages);
});

chatRoutes.post("/chats", async (req, res) => {
  const title = req.body?.title || "New chat";
  const chat = await prisma.chat.create({
    data: { userId: req.userId, title },
  });
  res.json(chat);
});

chatRoutes.post("/chats/:id/message", async (req, res) => {
  const chat = await prisma.chat.findUnique({ where: { id: req.params.id } });
  if (!chat || chat.userId !== req.userId)
    return res.status(404).json({ error: "not found" });
  const content = (req.body?.content || "").slice(0, 8000);
  if (!content) return res.status(400).json({ error: "content required" });

  await prisma.message.create({
    data: { chatId: chat.id, role: "user", content },
  });

  const messages = await prisma.message.findMany({
    where: { chatId: chat.id },
    orderBy: { createdAt: "asc" },
  });

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  try {
    const stream = await streamOpenAIResponse(messages);
let assistantText = "";

for await (const chunk of stream) {
  const text = chunk.choices?.[0]?.delta?.content || "";
  if (text) {
    assistantText += text;
    res.write(`data: ${JSON.stringify({ token: text })}\n\n`);
  }
}

    await prisma.message.create({
      data: { chatId: chat.id, role: "assistant", content: assistantText },
    });
    await prisma.chat.update({
      where: { id: chat.id },
      data: {
        updatedAt: new Date(),
        title: messages.length <= 2 ? content.slice(0, 60) : undefined,
      },
    });

    res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
    res.end();
  } catch (e) {
    res.write(`data: ${JSON.stringify({ error: "Model error" })}\n\n`);
    res.end();
  }
});
