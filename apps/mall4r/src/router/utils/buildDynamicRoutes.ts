import type { MenuItem } from "@/service/api/user";
import { type ComponentType, createElement } from "react";
import type { RouteObject } from "react-router-dom";
import { Outlet } from "react-router-dom";

type MenuTreeItem = Omit<MenuItem, "list"> & { list?: MenuTreeItem[] | null };

type ModuleLoader = () => Promise<{
	default: ComponentType<Record<string, unknown>>;
}>;

type RouteHandle = {
	menuId: number;
	parentId: number;
	title: string;
	icon?: string | null;
	perms?: string;
	order: number;
	isExternal: boolean;
	isGroup: boolean;
	isFallback: boolean;
	iframeUrl?: string;
	rawUrl?: string;
};

const pageModules: Record<string, ModuleLoader> = import.meta.glob<{
	default: ComponentType<Record<string, unknown>>;
}>("@/pages/**/index.tsx");
/*
• 这里用 Map 是没问题的，不必换成 WeakMap，原因如下：

  - pageModuleMap 只是模块级别的常量（整个路由工具文件里定义一次），里面缓存的键是字符串（比如 prod/prodTag），值是函
    数。WeakMap 只能用对象当 key，字符串会直接被转换成对象再丢失引用，根本达不到目的。
  - “内存泄漏”更多是担心缓存随着业务运行无限增长，但我们只在模块初始化时执行一次 import.meta.glob，将有限的页面模块注册
    进去，整个进程内就这些条目，不会随着运行动态增加。
  - 即便换成 WeakMap，也无法让字符串 key 自动被 GC（因为 WeakMap 本身要求 key 是对象），所以不会起到预期的“自动清理”效
    果。

  因此这个场景里使用 Map<string, ModuleLoader> 更合适：实现简单、类型安全，也不存在泄漏隐患。如果后续需要按需释放，可改
  为普通对象或 Map 清空，但没必要为此使用 WeakMap。

*/
const pageModuleMap = new Map<string, ModuleLoader>();

for (const [key, loader] of Object.entries(pageModules)) {
	const normalizedKey = key
		.replace(/\\/g, "/")
		.replace(/^.*\/pages\//, "")
		.replace(/\/index\.tsx$/, "");
	pageModuleMap.set(normalizedKey, loader);
}

const NOT_FOUND_LOADER: ModuleLoader = async () => import("@/pages/error/404");
const IFRAME_PAGE_LOADER: ModuleLoader = async () => import("@/pages/iframe");

export function buildRoutesFromMenu(menuList: MenuItem[]): RouteObject[] {
	return sortMenu(menuList as MenuTreeItem[])
		.map((item) => buildRoute(item, undefined))
		.filter((route): route is RouteObject => route !== null);
}

function buildRoute(
	item: MenuTreeItem,
	parentPath: string | undefined,
): RouteObject | null {
	const rawUrl = typeof item.url === "string" ? item.url.trim() : "";
	const isExternal = rawUrl ? isHttpUrl(rawUrl) : false;
	const normalizedPath =
		!isExternal && rawUrl ? normalizePath(rawUrl) : undefined;
	const nextParentPath = normalizedPath ?? parentPath;

	const childRoutes = sortMenu(getChildren(item))
		.map((child) => buildRoute(child, nextParentPath))
		.filter((route): route is RouteObject => route !== null);

	if (childRoutes.length > 0) {
		const { path } = deriveSegment(normalizedPath, parentPath);
		const groupRoute: RouteObject = {
			children: childRoutes,
			handle: buildHandle(item, {
				isGroup: true,
				rawUrl: rawUrl || undefined,
			}),
			element: createElement(Outlet),
		};

		if (path) {
			groupRoute.path = path;
		}

		return groupRoute;
	}

	if (!rawUrl || item.type === 2) {
		return null;
	}

	if (isExternal) {
		return createExternalRoute(item, rawUrl);
	}

	if (!normalizedPath) {
		return null;
	}

	return createInternalLeafRoute(item, normalizedPath, rawUrl, parentPath);
}

function createInternalLeafRoute(
	item: MenuTreeItem,
	normalizedPath: string,
	rawUrl: string,
	parentPath: string | undefined,
): RouteObject {
	const loader = pageModuleMap.get(normalizedPath);
	const { path, index } = deriveSegment(normalizedPath, parentPath);

	const handle = buildHandle(item, {
		rawUrl,
		isFallback: !loader,
	});
	const lazy = buildLazy(loader ?? NOT_FOUND_LOADER);

	if (index) {
		return {
			index: true,
			handle,
			lazy,
		};
	}

	return {
		path,
		handle,
		lazy,
	};
}

function createExternalRoute(item: MenuTreeItem, rawUrl: string): RouteObject {
	return {
		path: `i-${item.menuId}`,
		lazy: buildLazy(IFRAME_PAGE_LOADER),
		handle: buildHandle(item, {
			isExternal: true,
			iframeUrl: rawUrl,
			rawUrl,
		}),
	};
}

function getChildren(item: MenuTreeItem): MenuTreeItem[] {
	if (!item.list) {
		return [];
	}

	if (Array.isArray(item.list)) {
		return item.list;
	}

	return [];
}

function sortMenu<T extends { orderNum: number; menuId: number }>(
	items: T[],
): T[] {
	return [...items].sort((a, b) => {
		if (a.orderNum !== b.orderNum) {
			return a.orderNum - b.orderNum;
		}

		return a.menuId - b.menuId;
	});
}

function deriveSegment(
	path: string | undefined,
	parentPath: string | undefined,
): { path?: string; index?: boolean } {
	if (!path) {
		return {};
	}

	if (!parentPath) {
		return { path };
	}

	if (path === parentPath) {
		return { index: true };
	}

	if (path.startsWith(`${parentPath}/`)) {
		return { path: path.slice(parentPath.length + 1) };
	}

	return { path };
}

function buildLazy(loader: ModuleLoader) {
	return async () => {
		const module = await loader();
		return { Component: module.default };
	};
}

function buildHandle(
	item: MenuTreeItem,
	extra: Partial<RouteHandle> = {},
): RouteHandle {
	return {
		menuId: item.menuId,
		parentId: item.parentId,
		title: item.name,
		icon: item.icon,
		perms: item.perms,
		order: item.orderNum,
		isExternal: false,
		isGroup: false,
		isFallback: false,
		rawUrl: item.url ?? "",
		...extra,
	};
}

function normalizePath(url: string): string {
	return url.replace(/^\//, "").replace(/\/+/g, "/");
}

function isHttpUrl(url: string): boolean {
	return /^https?:\/\//i.test(url);
}
