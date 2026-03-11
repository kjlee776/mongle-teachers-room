import { createClient } from "@libsql/client/web";

export const turso = createClient({
  url: process.env.TURSO_DATABASE_URL || "libsql://dummy",
  authToken: process.env.TURSO_AUTH_TOKEN || "dummy",
});
