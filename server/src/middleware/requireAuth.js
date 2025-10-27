import { verifyJWT } from "../auth.js";
import { prisma } from "../db.js";

export async function requireAuth(req, res, next) {
  try {
    const token = req.cookies?.[process.env.COOKIE_NAME];
    if (!token) return res.status(401).json({ error: "Not authenticated" });

    const payload = verifyJWT(token);

    const session = await prisma.session.findUnique({
      where: { jwtId: payload.jti },
    });
    if (!session || session.expiresAt < new Date()) {
      return res.status(401).json({ error: "Session expired" });
    }

    req.userId = payload.sub;
    next();
  } catch (e) {
    return res.status(401).json({ error: "Invalid token" });
  }
}
