import useSettingStore from "@/store/settingStore";
import { ThemeMode } from "@/types/enum";
import { Switch } from "antd";

export default function ThemeModeSwitch({ className }: { className?: string }) {
	const { settings, actions } = useSettingStore();
	return (
		<Switch
			className={className}
			checkedChildren={ThemeMode.Light}
			unCheckedChildren={ThemeMode.Dark}
			defaultChecked
			checked={settings.themeMode === ThemeMode.Light}
			onChange={(checked) => {
				actions.setSettings({
					themeMode: checked ? ThemeMode.Light : ThemeMode.Dark,
				});
			}}
		/>
	);
}
