import dotenv from "dotenv";
dotenv.config();

import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "src/db/prisma/schema",
  migrations: {
    path: "src/db/prisma/migrations",
  },
  datasource: {
    url: process.env["DIRECT_URL"],
  },
});
