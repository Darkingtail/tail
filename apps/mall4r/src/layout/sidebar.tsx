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

const mergePaths = (base: string, segment: string) => {
	const normalizedBase = base.replace(/\/+$/, "");
	const normalizedSegment = segment.replace(/^\/+/, "");
	if (!normalizedBase) {
		return `/${normalizedSegment}`;
	}
	return `${normalizedBase}/${normalizedSegment}`;
};

const getRouteKey = (route: RouteObject): string | undefined => {
	const handle = route.handle as MenuHandle | undefined;
	return (
		route.id ??
		route.path ??
		(handle?.menuId ? String(handle.menuId) : undefined)
	);
};

const findRouteMatch = (
	items: RouteObject[],
	pathname: string,
	parentPath = "",
	ancestors: string[] = [],
): { key: string; ancestors: string[] } | undefined => {
	for (const item of items) {
		const key = getRouteKey(item);
		const currentPath =
			item.path && item.path.length > 0
				? mergePaths(parentPath, item.path)
				: parentPath;
		const matchPath =
			item.index && !item.path ? parentPath || "/" : currentPath || "/";

		if (pathname === matchPath && key) {
			return { key, ancestors };
		}

		if (item.children?.length) {
			const nextAncestors = key != null ? [...ancestors, key] : [...ancestors];
			const childMatch = findRouteMatch(
				item.children,
				pathname,
				currentPath,
				nextAncestors,
			);
			if (childMatch) {
				return childMatch;
			}
		}
	}

	return undefined;
};

export default function SideBar() {
	const themeMode = useSettingStore((state) => state.settings.themeMode);
	const menuList = useRouteStore((state) => state.menuList);
	const routes = useMemo(() => buildRoutesFromMenu(menuList), [menuList]);

	const navigate = useNavigate();
	const location = useLocation();
	const { token } = theme.useToken();

	const [selectedKeys, setSelectedKeys] = useState<string[]>([]);
	const [stateOpenKeys, setStateOpenKeys] = useState<string[]>([]);

	const resolvePathByKey = (
		key: string,
		items: RouteObject[],
		parentPath = "",
	): string | undefined => {
		for (const item of items) {
			const routeKey = getRouteKey(item);
			const currentPath =
				item.path && item.path.length > 0
					? mergePaths(parentPath, item.path)
					: parentPath;

			if (routeKey === key) {
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
				const key = getRouteKey(route) ?? crypto.randomUUID();
				const handle = route.handle as MenuHandle | undefined;

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
		setStateOpenKeys(openKeys);
	};

	useEffect(() => {
		const match = findRouteMatch(routes, location.pathname);
		if (match) {
			setSelectedKeys([match.key]);
			setStateOpenKeys(match.ancestors);
		} else {
			setSelectedKeys([]);
			setStateOpenKeys([]);
		}
	}, [routes, location.pathname]);

	useEffect(() => {
		if (!location.pathname && menuItems?.length) {
			const firstKey = menuItems[0]?.key;
			if (firstKey) {
				setSelectedKeys([String(firstKey)]);
			}
		}
	}, [menuItems, location.pathname]);

	return (
		<Layout.Sider
			theme={themeMode === ThemeMode.Dark ? "dark" : "light"}
			style={{
				color: token.colorText,
				background: token.colorBgElevated,
				borderInlineEnd: `1px solid ${token.colorSplit}`,
			}}
			className="border-e"
		>
			<Menu
				className="border-x-0!"
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
