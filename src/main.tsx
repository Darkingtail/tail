// eslint-disable-next-line import/no-unresolved
import SuspenseLoading from "@/components/suspense-loading/imdex";
// react-query
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
// react
import { Analytics } from "@vercel/analytics/react";
import { Suspense } from "react";
import ReactDOM from "react-dom/client";
// react helmet
import { HelmetProvider } from "react-helmet-async";
import "virtual:svg-icons-register";

import App from "@/App";

import worker from "./_mock";
// i18n
import "./locales/i18n";
// tailwind css
import "./theme/index.css";

// 📢 start service worker mock in development mode
worker.start({
  onUnhandledRequest: "bypass",
  // onUnhandledRequest: "warn", // 显示未处理请求的警告
  // quiet: false, // 启用日志
  //
});

// 创建一个 client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 3, // 失败重试次数
      gcTime: 300_000, // 缓存有效期 5m
      staleTime: 10_1000, // 数据变得 "陈旧"（stale）的时间 10s
      refetchOnWindowFocus: false, // 禁止窗口聚焦时重新获取数据
      refetchOnReconnect: false, // 禁止重新连接时重新获取数据
      refetchOnMount: false, // 禁止组件挂载时重新获取数据
    },
  },
});

// React root component, render app
const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
);

root.render(
  // HelmetProvider 是一个用于在 React 应用中添加 SEO 头部信息的组件。它可以帮助你更好地控制页面的标题、描述、关键词等元数据，从而提高页面的搜索引擎优化（SEO）效果。
  <HelmetProvider>
    {/* React Query 是一个用于在 React 应用中高效地获取、缓存和更新异步数据的库。 */}
    <QueryClientProvider client={queryClient}>
      {/* React Query Devtools 是一个浏览器扩展程序，用于调试和检查 React Query 的内部状态。 */}
      <ReactQueryDevtools initialIsOpen={false} />
      {/* 不写fallback，与Router中的组件懒加载一起使用 */}
      <Suspense fallback={<SuspenseLoading />}>
        {/* Analytics组件是一个用于收集和分析用户行为数据的组件，它可以帮助你更好地理解用户需求和行为模式，从而优化应用的设计和功能 */}
        <Analytics />
        {/* 路由根节点 */}
        <App />
      </Suspense>
    </QueryClientProvider>
  </HelmetProvider>
);
