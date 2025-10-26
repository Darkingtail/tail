import type { ThemeConfig } from "antd";

import type { ThemeColorPresets } from "@/types/enum";
/**
 * Antd theme editor: https://ant.design/theme-editor-cn
 */
const customThemeTokenConfig: ThemeConfig["token"] = {
	colorSuccess: "#22C55E",
	colorWarning: "#FFAB00",
	colorError: "#FF5630",
	colorInfo: "#00B8D9",

	// 线性化
	wireframe: false,

	borderRadiusSM: 2,
	borderRadius: 4,
	borderRadiusLG: 8,
};

const customComponentConfig: ThemeConfig["components"] = {
	Breadcrumb: {
		fontSize: 12,
		separatorMargin: 4,
	},
	Menu: {
		fontSize: 14,
		colorFillAlter: "transparent",
		itemColor: "rgb(145, 158, 171)",
		motionDurationMid: "0.125s",
		motionDurationSlow: "0.125s",
	},
};

const colorPrimarys: {
	[k in ThemeColorPresets]: string;
} = {
	default: "#0053d9",
	cyan: "#078DEE",
	purple: "#7635DC",
	blue: "#2065D1",
	orange: "#FDA92D",
	red: "#FF3030",
};

const themeModeToken: Record<"dark" | "light", ThemeConfig> = {
	dark: {
		token: {
			colorBgLayout: "#161c24",
			colorBgContainer: "#212b36",
			colorBgElevated: "#161c24",
		},
		components: {
			Layout: {
				headerPadding: "0",
				headerBg: "#161c24",
				siderBg: "#161c24",
			},
			Switch: {},
		},
	},
	light: {
		components: {
			Layout: {
				headerPadding: "0",
				headerBg: "#fff",
				siderBg: "#fff",
			},
		},
	},
};

export {
	colorPrimarys,
	customComponentConfig,
	customThemeTokenConfig,
	themeModeToken,
};
