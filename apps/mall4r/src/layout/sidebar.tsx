import { buildRoutesFromMenu } from "@/router/utils/buildDynamicRoutes";
import useRouteStore from "@/store/routerStore";
import useSettingStore from "@/store/settingStore";
import { ThemeMode } from "@/types/enum";
import { Layout, Menu, type MenuProps, theme } from "antd";
import { useEffect, useMemo, useState } from "react";
import type { RouteObject } from "react-router-dom";
import { useLocation, useNavigate } from "react-router-dom";

type MenuHandle = {
	menuId: number;
	parentId: number;
	title: string;
	icon?: string | null;
	[key: string]: unknown;
};

export default function SideBar() {
	const themeMode = useSettingStore((state) => state.settings.themeMode);
	const menuList = useRouteStore((state) => state.menuList);

	const [selectedKeys, setSelectedKeys] = useState<string[]>([]);
	const [stateOpenKeys, setStateOpenKeys] = useState<string[]>([]);

	const routes = useMemo(() => buildRoutesFromMenu(menuList), [menuList]);
	console.log("routes:", routes);

	const navigate = useNavigate();

	const location = useLocation();

	const { token } = theme.useToken();

	const mergePaths = (base: string, segment: string) => {
		const normalizedBase = base.replace(/\/+$/, "");
		const normalizedSegment = segment.replace(/^\/+/, "");
		if (!normalizedBase) {
			return `/${normalizedSegment}`;
		}
		return `${normalizedBase}/${normalizedSegment}`;
	};

	const resolvePathByKey = (
		key: string,
		items: RouteObject[],
		parentPath = "",
	): string | undefined => {
		for (const item of items) {
			const handle = item.handle as MenuHandle | undefined;
			const itemKey =
				item.id ??
				item.path ??
				(handle?.menuId ? String(handle.menuId) : undefined);

			const currentPath =
				item.path && item.path.length > 0
					? mergePaths(parentPath, item.path)
					: parentPath;

			if (itemKey === key) {
				if (item.index) {
					return parentPath || "/";
				}
				if (item.path) {
					return currentPath || "/";
				}
			}

			if (item.children && item.children.length > 0) {
				const childPath = resolvePathByKey(key, item.children, currentPath);
				if (childPath) {
					return childPath;
				}
			}
		}

		return undefined;
	};

	const onClick: MenuProps["onClick"] = (e) => {
		setSelectedKeys([e.key]);
		const path = resolvePathByKey(e.key, routes);
		if (path) {
			navigate(path);
		}
	};

	const menuItems = useMemo(() => {
		type MenuItem = NonNullable<MenuProps["items"]>[number];

		const generateMenu = (items: RouteObject[]): MenuProps["items"] => {
			return items.map<MenuItem>((route) => {
				const handle = route.handle as MenuHandle | undefined;
				const key =
					route.id ??
					route.path ??
					(handle?.menuId ? String(handle.menuId) : crypto.randomUUID());

				return {
					key,
					label: handle?.title ?? route.path ?? "未命名菜单",
					children: route.children ? generateMenu(route.children) : undefined,
				};
			});
		};

		return generateMenu(routes);
	}, [routes]);

	const onOpenChange: MenuProps["onOpenChange"] = (openKeys) => {
		console.log("openKeys:", openKeys);
		setStateOpenKeys(openKeys);
	};

	useEffect(() => {
		const findFirstLeaf = (items?: MenuProps["items"]): string | undefined => {
			if (!items) return;
			for (const item of items) {
				if (!item) continue;
				if (!("children" in item) || !item.children?.length) {
					return String(item.key);
				}
				const child = findFirstLeaf(item.children);
				if (child) return child;
			}
		};

		const innermostKey = findFirstLeaf(menuItems);
		if (innermostKey) {
			setSelectedKeys([innermostKey]);
		}
	}, [menuItems]);
	// codex resume 019a863a-22bc-7831-a58a-2a07f81cbc7d
	useEffect(() => {
		const findKeyByPath = (
			routes: RouteObject[],
			pathname: string,
		): string | undefined => {
			const path = pathname.slice(1);
			for (const item of routes) {
				if (item.path === path) {
					return path;
				}
				if (item.children && item.children.length > 0) {
					const route = item.children.find((i) => i.path === path);
					return route ? path : findKeyByPath(item.children, pathname);
				}
				return undefined;
			}
			return undefined;
		};
		const key = findKeyByPath(routes, location.pathname);
		if (key) {
			setSelectedKeys([String(key)]);
		}
	}, [routes, location]);

	return (
		<Layout.Sider
			theme={themeMode === ThemeMode.Dark ? "dark" : "light"}
			style={{
				color: token.colorText,
				background: token.colorBgElevated,
			}}
		>
			<Menu
				onClick={onClick}
				mode="inline"
				selectedKeys={selectedKeys}
				items={menuItems}
				openKeys={stateOpenKeys}
				onOpenChange={onOpenChange}
			/>
		</Layout.Sider>
	);
}
