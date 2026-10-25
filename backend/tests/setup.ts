// Variáveis mínimas para o env.ts validar no boot. Sem chaves de IA,
// a classificação cai no fallback por palavras-chave e nenhum teste chama a rede.
process.env.NODE_ENV = "test";
process.env.LOG_LEVEL = "fatal";
process.env.SUPABASE_URL = "https://example.supabase.co";
process.env.SUPABASE_KEY = "test-key";
process.env.API_KEY = "test-api-key";
process.env.JWT_SECRET = "test-jwt-secret-with-enough-length";
delete process.env.OPENAI_API_KEY;
delete process.env.ANTHROPIC_API_KEY;
