import { describe, expect, it } from "vitest";
import {
  classifyIntent,
  classifyWithKeywords,
  parseClassification,
} from "../src/services/ai.service";

describe("parseClassification", () => {
  it("aceita uma resposta no formato esperado", () => {
    const raw = '{"intent":"VENDAS","confidence":"high","reasoning":"pediu preço"}';
    expect(parseClassification(raw)).toEqual({
      intent: "VENDAS",
      confidence: "high",
      reasoning: "pediu preço",
    });
  });

  it("recusa intent fora do enum", () => {
    expect(() =>
      parseClassification('{"intent":"SALES","confidence":"high"}')
    ).toThrow();
  });

  it("recusa texto que não é JSON", () => {
    expect(() => parseClassification("Claro! A intenção é VENDAS.")).toThrow();
  });
});

describe("classifyWithKeywords", () => {
  it("classifica pedido de preço como VENDAS", () => {
    expect(classifyWithKeywords("Quanto custa o plano Pro?").intent).toBe("VENDAS");
  });

  it("classifica relato de erro como SUPORTE", () => {
    expect(classifyWithKeywords("O app travou e não consigo entrar").intent).toBe(
      "SUPORTE"
    );
  });

  it("usa OUTROS com confiança baixa quando nada bate", () => {
    expect(classifyWithKeywords("Bom dia, tudo bem?")).toMatchObject({
      intent: "OUTROS",
      confidence: "low",
    });
  });
});

describe("classifyIntent", () => {
  it("cai no fallback por palavras-chave sem chaves de IA", async () => {
    const result = await classifyIntent("Quero uma demonstração do produto");
    expect(result.intent).toBe("VENDAS");
    expect(result.reasoning).toMatch(/palavras-chave/);
  });
});
