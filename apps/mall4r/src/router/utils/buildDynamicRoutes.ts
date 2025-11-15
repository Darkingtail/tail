import type { MenuItem } from "@/service/api/user";
import { type ComponentType, createElement } from "react";
import type { RouteObject } from "react-router-dom";
import { Outlet } from "react-router-dom";

type MenuTreeItem = MenuItem & { list?: MenuTreeItem[] | null };

type ModuleLoader = () => Promise<{ default: ComponentType<any> }>;

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

const pageModules = import.meta.glob<ModuleLoader>("@/pages/**/index.tsx");
const pageModuleMap = new Map<string, ModuleLoader>();

for (const [key, loader] of Object.entries(pageModules)) {
	const normalizedKey = key
		.replace(/\\/g, "/")
		.replace(/^.*\/pages\//, "")
		.replace(/\/index\.tsx$/, "");
	pageModuleMap.set(normalizedKey, loader);
}

const NOT_FOUND_LOADER = async () => import("@/pages/error/404");
const IFRAME_PAGE_LOADER = async () => import("@/pages/iframe");

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
		const { path, index } = deriveSegment(normalizedPath, parentPath);
		const groupRoute: RouteObject = {
			children: childRoutes,
			handle: buildHandle(item, {
				isGroup: true,
				rawUrl: rawUrl || undefined,
			}),
			element: createElement(Outlet),
		};

		if (index) {
			groupRoute.index = true;
		} else if (path) {
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

	const route: RouteObject = {
		handle: buildHandle(item, {
			rawUrl,
			isFallback: !loader,
		}),
	};

	if (index) {
		route.index = true;
	} else if (path) {
		route.path = path;
	}

	route.lazy = buildLazy(loader ?? NOT_FOUND_LOADER);

	return route;
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
	console.log("path parentPath:", path, parentPath);
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
		console.log("module:", module);
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
