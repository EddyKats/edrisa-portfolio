import { defineConfig } from "@neon/config/v1";

export default defineConfig({
  buckets: {
    "edrisa-media": { access: "public_read" },
  },
});
