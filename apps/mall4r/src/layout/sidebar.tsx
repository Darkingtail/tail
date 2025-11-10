import useRouteStore from "@/store/routerStore";
import useSettingStore from "@/store/settingStore";
import { ThemeMode } from "@/types/enum";
import { Layout, Menu, type MenuProps, theme } from "antd";
import { useEffect, useState } from "react";
import type { RouteObject } from "react-router-dom";

export default function SideBar() {
	const themeMode = useSettingStore((state) => state.settings.themeMode);
	const routes = useRouteStore((state) => state.routes);
	const [menu, setMenu] = useState([]);
	const { token } = theme.useToken();
	console.log("routes:", routes);

	const onClick: MenuProps["onClick"] = (e) => {
		console.log("click", e);
	};

	useEffect(() => {
		const generateMenu = (routes: RouteObject[]) => {
			return routes.map((i) => {
				if (i.children && i.children.length > 0) {
					i.children = generateMenu(i.children);
				}
				return {
					...i,
					title: i.handle.title,
				};
			});
		};
		console.log("generateMenu(routes):", generateMenu(routes));
		// setMenu( generateMenu(routes))
	});

	return (
		<Layout.Sider
			theme={themeMode === ThemeMode.Dark ? "dark" : "light"}
			style={{
				color: token.colorText,
				background: token.colorBgElevated,
			}}
		>
			<Menu onClick={onClick} mode="vertical" items={menu} />
		</Layout.Sider>
	);
}
