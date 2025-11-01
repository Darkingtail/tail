import useSettingStore from "@/store/settingStore";
import { ThemeMode } from "@/types/enum";
import { Layout, theme } from "antd";

export default function SideBar() {
	const themeMode = useSettingStore((state) => state.settings.themeMode);
	const { token } = theme.useToken();

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
