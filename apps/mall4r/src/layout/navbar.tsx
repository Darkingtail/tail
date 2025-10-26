import ThemeModeSwitch from "@/components/theme-mode-switch";
import { loginApi } from "@/service/api/login";
import useUserStore from "@/store/userStore";
import type { MenuProps } from "antd";
import { Button, Dropdown } from "antd";
import { useNavigate } from "react-router-dom";

export default function NavBar() {
	const userStore = useUserStore();
	const navigate = useNavigate();

	const onClick: MenuProps["onClick"] = async ({ key }) => {
		if (key !== "1") return;
		try {
			await loginApi.logOut({ t: Date.now() });
		} catch (err) {
			console.error("logOut failed:", err);
		} finally {
			userStore.actions.clearUserToken();
			navigate("/login", { replace: true });
		}
	};

	const items: MenuProps["items"] = [
		{
			key: "1",
			label: "Logout",
		},
	];
	return (
		<>
			<ThemeModeSwitch />
			<Dropdown menu={{ items, onClick }}>
				<Button type="text">Hover me</Button>
			</Dropdown>
		</>
	);
}
