import path from "node:path";

import react from "@vitejs/plugin-react";
import { visualizer } from "rollup-plugin-visualizer";
import { defineConfig, loadEnv } from "vite";
import { createSvgIconsPlugin } from "vite-plugin-svg-icons";
import tsconfigPaths from "vite-tsconfig-paths";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const base = env.VITE_APP_BASE_PATH || "/";
  const isProduction = mode === "production";

  return {
    base,
    plugins: [
      react(),
      tsconfigPaths(),
      createSvgIconsPlugin({
        iconDirs: [path.resolve(process.cwd(), "src/assets/icons")],
        symbolId: "icon-[dir]-[name]",
      }),
      isProduction &&
        visualizer({
          open: true,
          gzipSize: true,
          brotliSize: true,
        }),
    ],
    server: {
      open: false,
      host: true,
      port: 8686,
      proxy: {
        "/api": {
          target: "http://localhost:3000",
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, ""),
        },
        "/mall4j": {
          target: "http://localhost:8085",
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/mall4j/, ""),
        },
      },
      optimizeDeps: {
        include: ["react", "react-dom", "react-router-dom", "antd"],
      },
      esbuild: {
        drop: isProduction ? ["console", "debugger"] : [],
      },
      build: {
        target: "esnext",
        minify: "esbuild",
        sourcemap: false,
        cssCodeSplit: true,
        chunkSizeWarningLimit: 1000, // 提高警告阈值到 1000 KB
        rollupOptions: {
          // 打包时用到，开发时直接访问的是文件夹路径，vite启动后相当于服务器
          input: {
            index: path.resolve(__dirname, "src/index.html"),
            login: path.resolve(__dirname, "src-multi-page/index.html"),
          },
          output: {
            dir: "dist", // 所有打包文件都会放在 dist 目录下
            format: "es", // 使用 ES 模块

            // 针对每个入口文件生成特定文件夹
            entryFileNames: (chunk) => {
              // 将入口文件的名称作为文件夹名
              return `assets/${chunk.name}/${chunk.name}.js`; // 例如: assets/index/index.js
            },
            chunkFileNames: (chunk) => {
              return `assets/${chunk.name}.js`; // 例如: assets/index/index.js
            },
            assetFileNames: "assets/static/[name].[ext]", // 静态资源路径
            manualChunks: {
              "vendor-react": ["react", "react-dom", "react-router-dom"],
              "vendor-antd": [
                "antd",
                "@ant-design/icons",
                "@ant-design/cssinjs",
              ],
              "vendor-charts": ["apexcharts", "react-apexcharts"],
              "vendor-utils": ["axios", "dayjs", "i18next", "zustand"],
              "vendor-ui": [
                "framer-motion",
                "styled-components",
                "@iconify/react",
              ],
            },
          },
        },
      },
    },
  };
});
