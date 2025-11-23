import type { ThemeConfig } from "antd";

/**
 * 基础设计令牌（深浅色共用）
 */
const customThemeTokenConfig: ThemeConfig["token"] = {
	colorPrimary: "#2563eb",
	colorSuccess: "#16a34a",
	colorWarning: "#f59e0b",
	colorError: "#dc2626",
	colorInfo: "#0ea5e9",

	borderRadiusSM: 4,
	borderRadius: 6,
	borderRadiusLG: 10,

	fontFamily:
		"'Inter', 'Segoe UI', 'PingFang SC', 'Microsoft YaHei', sans-serif",

	// 关闭线框模式，恢复 Ant Design 默认的阴影和动效
	wireframe: false,
};

/**
 * 深浅色主题专属令牌
 */
const themeModeToken: Record<"dark" | "light", ThemeConfig> = {
	dark: {
		token: {
			colorBgBase: "#0f172a",
			colorBgLayout: "#0f172a",
			colorBgContainer: "#1e293b",
			colorBgElevated: "#1e293b",
			colorBorder: "#233047",
			colorBorderSecondary: "#1c2536",
			colorFillQuaternary: "#23354f",
			colorTextBase: "#e2e8f0",
			colorText: "#f8fafc",
			colorTextSecondary: "#cbd5f5",
			colorTextTertiary: "#94a3b8",
			colorTextHeading: "#ffffff",
			controlItemBgActive: "#1d4ed8",
			controlOutline: "rgba(37, 99, 235, 0.45)",
			colorSplit: "rgba(148, 163, 184, 0.24)",
			boxShadowSecondary: "0 12px 40px rgba(15, 23, 42, 0.65)",
		},
		components: {
			Layout: {
				headerPadding: "0",
				headerBg: "#111c32",
				siderBg: "#0b1529",
				bodyBg: "#0f172a",
				triggerBg: "#14203a",
				triggerColor: "#e2e8f0",
			},
			Content: {
				bgColor: "#1e293b",
			},
			Menu: {
				itemColor: "#cbd5f5",
				itemHoverBg: "rgba(37, 99, 235, 0.12)",
				itemSelectedBg: "rgba(37, 99, 235, 0.24)",
				itemSelectedColor: "#f8fafc",
				groupTitleColor: "#94a3b8",
				subMenuItemBg: "transparent",
			},
			Button: {
				defaultBg: "#1e293b",
				defaultBorderColor: "#233047",
				defaultColor: "#e2e8f0",
				ghostBg: "transparent",
				ghostColor: "#e2e8f0",
			},
			Card: {
				colorBgContainer: "#1e293b",
				borderRadiusLG: 12,
				padding: 20,
				boxShadow: "0 16px 32px rgba(15, 23, 42, 0.45)",
			},
			Modal: {
				colorBgElevated: "#1e293b",
				headerBg: "#1e293b",
				titleColor: "#f1f5f9",
				borderRadiusLG: 14,
			},
		},
	},
	light: {
		token: {
			colorBgBase: "#f5f7fb",
			colorBgLayout: "#f5f7fb",
			colorBgContainer: "#ffffff",
			colorBgElevated: "#ffffff",
			colorBorder: "#e2e8f0",
			colorBorderSecondary: "#edf2f7",
			colorFillQuaternary: "#f1f5f9",
			colorTextBase: "#0f172a",
			colorText: "#1f2937",
			colorTextSecondary: "#4b5563",
			colorTextTertiary: "#6b7280",
			colorTextHeading: "#111827",
			controlItemBgActive: "rgba(37, 99, 235, 0.12)",
			controlOutline: "rgba(37, 99, 235, 0.35)",
			colorSplit: "rgba(203, 213, 225, 0.6)",
			boxShadowSecondary: "0 12px 32px rgba(15, 23, 42, 0.08)",
		},
		components: {
			Layout: {
				headerPadding: "0",
				headerBg: "#ffffff",
				siderBg: "#ffffff",
				bodyBg: "#f5f7fb",
				triggerBg: "#e7edf8",
				triggerColor: "#334155",
			},
			Content: {
				bgColor: "#ffffff",
			},
			Menu: {
				itemColor: "#475569",
				itemHoverBg: "rgba(37, 99, 235, 0.08)",
				itemSelectedBg: "rgba(37, 99, 235, 0.16)",
				itemSelectedColor: "#1d4ed8",
				groupTitleColor: "#94a3b8",
				subMenuItemBg: "transparent",
			},
			Button: {
				defaultBg: "#ffffff",
				defaultBorderColor: "#dbe3f4",
				defaultColor: "#1f2937",
				ghostBg: "transparent",
				ghostColor: "#1f2937",
			},
			Card: {
				colorBgContainer: "#ffffff",
				borderRadiusLG: 12,
				padding: 20,
				boxShadow: "0 18px 36px rgba(15, 23, 42, 0.06)",
			},
			Modal: {
				colorBgElevated: "#ffffff",
				headerBg: "#ffffff",
				titleColor: "#1f2937",
				borderRadiusLG: 14,
			},
		},
	},
};

export { customThemeTokenConfig, themeModeToken };
