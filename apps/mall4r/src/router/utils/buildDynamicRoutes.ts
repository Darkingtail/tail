import type { MenuItem } from "@/service/api/user";
import type { ComponentType } from "react";
import type { RouteObject } from "react-router-dom";

type MenuTreeItem = MenuItem & { list?: MenuTreeItem[] | null };
type ModuleLoader = () => Promise<{ default: ComponentType<any> }>;
type RouteHandle = {
	menuId: number;
	parentId: number;
	title: string;
	icon?: string | null;
	perms?: string;
	order?: number;
	isExternal: boolean;
	iframeUrl?: string;
	rawUrl: string;
};

const pageModules = import.meta.glob<ModuleLoader>("@/pages/**/index.tsx");

const NOT_FOUND_LOADER = async () => import("@/pages/error/404");
const IFRAME_PAGE_LOADER = async () => import("@/pages/iframe");

export function buildRoutesFromMenu(menuList: MenuItem[]): RouteObject[] {
	const dynamicRoutes: RouteObject[] = [];

	const traverse = (items: MenuTreeItem[]) => {
		for (const item of items) {
			const children = getChildren(item);

			if (children.length > 0) {
				traverse(children);
				continue;
			}

			if (!item.url || !item.url.trim()) {
				continue;
			}

			// 2 代表按钮之类的操作点，不需要生成路由
			if (item.type === 2) {
				continue;
			}

			const rawUrl = item.url.trim();

			if (isHttpUrl(rawUrl)) {
				dynamicRoutes.push(createExternalRoute(item, rawUrl));
				continue;
			}

			dynamicRoutes.push(createInternalRoute(item, rawUrl));
		}
	};

	traverse(menuList as MenuTreeItem[]);

	return dynamicRoutes;
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

function createInternalRoute(item: MenuTreeItem, rawUrl: string): RouteObject {
	const path = normalizePath(rawUrl);
	if (!path) {
		return createFallbackRoute(item, rawUrl);
	}

	const moduleKey = `@/pages/${path}/index.tsx`;
	const loader = pageModules[moduleKey];

	if (!loader) {
		return createFallbackRoute(item, rawUrl, path);
	}

	return {
		path,
		lazy: buildLazy(loader),
		handle: buildHandle(item, {
			isExternal: false,
			rawUrl,
		}),
	};
}

function createExternalRoute(item: MenuTreeItem, rawUrl: string): RouteObject {
	const path = `i-${item.menuId}`;

	return {
		path,
		lazy: buildLazy(IFRAME_PAGE_LOADER),
		handle: buildHandle(item, {
			isExternal: true,
			iframeUrl: rawUrl,
			rawUrl,
		}),
	};
}

function createFallbackRoute(
	item: MenuTreeItem,
	rawUrl: string,
	path: string = normalizePath(rawUrl) || `fallback-${item.menuId}`,
): RouteObject {
	return {
		path,
		lazy: buildLazy(NOT_FOUND_LOADER),
		handle: buildHandle(item, {
			isExternal: false,
			rawUrl,
		}),
	};
}

function buildLazy(loader: ModuleLoader) {
	return async () => {
		const module = await loader();
		return { Component: module.default };
	};
}

function buildHandle(
	item: MenuTreeItem,
	extra: Omit<
		RouteHandle,
		"menuId" | "parentId" | "title" | "icon" | "perms" | "order"
	>,
): RouteHandle {
	return {
		menuId: item.menuId,
		parentId: item.parentId,
		title: item.name,
		icon: item.icon,
		perms: item.perms,
		order: item.orderNum,
		...extra,
	};
}

function normalizePath(url: string): string {
	return url.replace(/^\//, "").replace(/\/+/g, "/");
}

function isHttpUrl(url: string): boolean {
	return /^https?:\/\//i.test(url);
}
