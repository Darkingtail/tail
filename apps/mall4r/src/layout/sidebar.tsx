import useRouteStore from "@/store/routerStore";
import useSettingStore from "@/store/settingStore";
import { ThemeMode } from "@/types/enum";
import { Layout, theme } from "antd";

export default function SideBar() {
	const themeMode = useSettingStore((state) => state.settings.themeMode);
	const routes = useRouteStore((state) => state.routes);
	const { token } = theme.useToken();
	console.log("routes:", routes);

	return (
		<Layout.Sider
			theme={themeMode === ThemeMode.Dark ? "dark" : "light"}
			style={{
				color: token.colorText,
				background: token.colorBgElevated,
			}}
		>
			12312313131
		</Layout.Sider>
	);
}
