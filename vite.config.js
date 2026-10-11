import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  publicDir: "public",
  build: {
    rollupOptions: {
      input: {
        home: "index.html",
        products: "products.html",
        about: "about.html",
        contact: "contact.html"
      }
    }
  }
});
