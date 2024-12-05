// react-query
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
// react
import { Analytics } from "@vercel/analytics/react";
import React from "react";
import { Suspense } from "react";
import ReactDOM from "react-dom/client";
// react helmet
import { HelmetProvider } from "react-helmet-async";
// eslint-disable-next-line import/no-unresolved
import "virtual:svg-icons-register";
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

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
	<HelmetProvider>
		<QueryClientProvider client={queryClient}>
			<ReactQueryDevtools initialIsOpen={false} />
			<Suspense>
				<Analytics />
				Tail Admin
			</Suspense>
		</QueryClientProvider>
	</HelmetProvider>,
);
