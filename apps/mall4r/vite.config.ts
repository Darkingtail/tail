import react from "@vitejs/plugin-react-swc";
import { fileURLToPath } from "node:url";
import { type UserConfig, defineConfig } from "vite";

// https://vite.dev/config/
export default defineConfig((config: UserConfig) => {
  console.log("vite user config:", config);
  return {
    plugins: [react()],
    resolve: {
      alias: {
        "@": fileURLToPath(new URL("./src", import.meta.url)),
        "~": fileURLToPath(new URL("./", import.meta.url)),
      },
    },
  };
});
