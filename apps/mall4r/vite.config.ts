import { fileURLToPath } from "node:url";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react-swc";
import { type UserConfig, defineConfig } from "vite";

// https://vite.dev/config/
export default defineConfig((config: UserConfig) => {
	console.log("vite user config:", config);
	return {
		// 让 Vite 的“项目根”就是子包，避免从 monorepo 根搜配置
		root: __dirname,
		plugins: [react(), tailwindcss()],
		resolve: {
			alias: {
				"@": fileURLToPath(new URL("./src", import.meta.url)),
				"~": fileURLToPath(new URL("./", import.meta.url)),
			},
		},
		server: {
			open: false,
			host: true,
			proxy: {
				"/api": {
					target: "http://localhost:8085",
					changeOrigin: true,
					rewrite: (path) => path.replace(/^\/api/, ""),
				},
			},
		},
	};
});
