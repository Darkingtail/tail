import useSettingStore from "@/store/settingStore";
import { ThemeMode } from "@/types/enum";
import { StyleProvider } from "@ant-design/cssinjs";
import { ConfigProvider, theme } from "antd";
import "antd/dist/reset.css";
import { customThemeTokenConfig, themeModeToken } from "./theme";

type Props = {
	children: React.ReactNode;
};

export default function AntdConfig({ children }: Props) {
	const { settings } = useSettingStore();

	const algorithm =
		settings.themeMode === ThemeMode.Light
			? theme.defaultAlgorithm
			: theme.darkAlgorithm;

	return (
		<ConfigProvider
			theme={{
				token: {
					...customThemeTokenConfig,
					...themeModeToken[settings.themeMode].token,
				},
				components: {
					...themeModeToken[settings.themeMode].components,
				},
				algorithm,
			}}
		>
			{/* https://ant.design/docs/react/compatible-style-cn#styleprovider */}
			<StyleProvider hashPriority="high">{children}</StyleProvider>
		</ConfigProvider>
	);
}
