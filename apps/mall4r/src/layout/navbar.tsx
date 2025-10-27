import ThemeModeSwitch from "@/components/theme-mode-switch";
import useUserStore from "@/store/userStore";
import type { MenuProps } from "antd";
import { Button, Dropdown, Layout } from "antd";
import { useNavigate } from "react-router-dom";

const { Header } = Layout;

export default function NavBar() {
	const userStore = useUserStore();
	const navigate = useNavigate();

	const onClick: MenuProps["onClick"] = async ({ key }) => {
		if (key !== "1") return;
		try {
			await userStore.actions.logOut({ t: Date.now() });
		} catch (err) {
			console.error("logOut failed:", err);
		} finally {
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
		<Header className="flex justify-between">
			<span>mall4j</span>
			<span>
				<ThemeModeSwitch />
				<Dropdown menu={{ items, onClick }}>
					<Button type="link">Hover me</Button>
				</Dropdown>
			</span>
		</Header>
	);
}
