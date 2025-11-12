import useRouteStore from "@/store/routerStore";
import useSettingStore from "@/store/settingStore";
import { ThemeMode } from "@/types/enum";
import { Layout, Menu, type MenuProps, theme } from "antd";
import { useMemo } from "react";
import type { RouteObject } from "react-router-dom";

type MenuHandle = {
	menuId: number;
	parentId: number;
	title: string;
	icon?: string | null;
	[key: string]: unknown;
};

export default function SideBar() {
	const themeMode = useSettingStore((state) => state.settings.themeMode);
	const routes = useRouteStore((state) => state.routes);
	const { token } = theme.useToken();
	console.log("routes:", routes);

	const onClick: MenuProps["onClick"] = (e) => {
		console.log("click", e);
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

	return (
		<Layout.Sider
			theme={themeMode === ThemeMode.Dark ? "dark" : "light"}
			style={{
				color: token.colorText,
				background: token.colorBgElevated,
			}}
		>
			<Menu onClick={onClick} mode="vertical" items={menuItems} />
		</Layout.Sider>
	);
}
