import type { FastifyInstance } from "fastify";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";

// O Supabase fica fora dos testes: só /leads/stats é exercitado, com dados fixos.
vi.mock("../src/services/lead.service", () => ({
  createLead: vi.fn(),
  getLeadById: vi.fn(),
  listLeads: vi.fn(),
  getLeadStats: vi.fn().mockResolvedValue({
    total: 3,
    by_intent: { VENDAS: 2, SUPORTE: 1, OUTROS: 0 },
    last_7_days: 3,
    last_30_days: 3,
  }),
}));

const { buildApp } = await import("../src/app.bootstrap");

let app: FastifyInstance;

beforeAll(async () => {
  app = await buildApp();
  await app.ready();
});

afterAll(async () => {
  await app.close();
});

describe("API", () => {
  it("GET /health responde ok", async () => {
    const res = await app.inject({ method: "GET", url: "/health" });
    expect(res.statusCode).toBe(200);
    expect(res.json().data.status).toBe("ok");
  });

  it("GET /leads sem token responde 401", async () => {
    const res = await app.inject({ method: "GET", url: "/leads" });
    expect(res.statusCode).toBe(401);
  });

  it("POST /auth/token com API key errada responde 401", async () => {
    const res = await app.inject({
      method: "POST",
      url: "/auth/token",
      payload: { apiKey: "errada" },
    });
    expect(res.statusCode).toBe(401);
  });

  it("token emitido com a API key certa libera /leads/stats", async () => {
    const auth = await app.inject({
      method: "POST",
      url: "/auth/token",
      payload: { apiKey: "test-api-key" },
    });
    expect(auth.statusCode).toBe(200);

    const res = await app.inject({
      method: "GET",
      url: "/leads/stats",
      headers: { authorization: `Bearer ${auth.json().data.token}` },
    });
    expect(res.statusCode).toBe(200);
    expect(res.json().data.by_intent.VENDAS).toBe(2);
  });
});
