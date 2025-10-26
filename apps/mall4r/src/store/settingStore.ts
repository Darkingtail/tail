import { ThemeMode } from "@/types/enum";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

type SettingsType = {
	themeMode: ThemeMode;
};

type SettingStore = {
	settings: SettingsType;
	// 使用 actions 命名空间来存放所有的 action
	actions: {
		setSettings: (settings: SettingsType) => void;
		clearSettings: () => void;
	};
};

const useSettingStore = create<SettingStore>()(
	persist(
		(set) => ({
			settings: {
				themeMode: ThemeMode.Light,
			},
			actions: {
				setSettings: (settings) => {
					set({ settings });
				},
				clearSettings() {
					useSettingStore.persist.clearStorage();
				},
			},
		}),
		{
			name: "settings", // name of the item in the storage (must be unique)
			storage: createJSONStorage(() => localStorage), // (optional) by default, 'localStorage' is used
			partialize: (state) => ({ settings: state.settings }),
		},
	),
);

export default useSettingStore;
