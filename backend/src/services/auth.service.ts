import { createHash, timingSafeEqual } from "node:crypto";
import type { FastifyInstance } from "fastify";
import { env } from "../config/env";
import { logger } from "../config/logger";

/**
 * Compara em tempo constante. O hash deixa os dois lados do mesmo tamanho,
 * exigência do timingSafeEqual, sem vazar o tamanho da chave.
 */
function isValidApiKey(apiKey: string): boolean {
  const expected = createHash("sha256").update(env.API_KEY).digest();
  const received = createHash("sha256").update(apiKey).digest();
  return timingSafeEqual(expected, received);
}

/**
 * Valida a API key recebida e emite um JWT com validade de 24 horas.
 */
export async function generateAccessToken(
  fastify: FastifyInstance,
  apiKey: string
): Promise<string> {
  if (!isValidApiKey(apiKey)) {
    logger.warn("Tentativa de autenticação com API key inválida");
    throw new Error("API key inválida");
  }

  const token = await fastify.jwt.sign(
    { scope: "api" },
    { expiresIn: "24h" }
  );

  logger.info("JWT emitido com sucesso");
  return token;
}
