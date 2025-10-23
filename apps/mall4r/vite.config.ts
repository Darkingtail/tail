import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react-swc";
import { fileURLToPath } from "node:url";
import { type UserConfig, defineConfig } from "vite";

// codex resume 0199f562-ca2a-7550-9302-90c9af7f3fb8
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
