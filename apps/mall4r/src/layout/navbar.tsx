import ThemeModeSwitch from "@/components/theme-mode-switch";
import useUserStore from "@/store/userStore";
import type { MenuProps } from "antd";
import { Button, Dropdown, Layout } from "antd";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const { Header } = Layout;

export default function NavBar() {
	const userStore = useUserStore();
	const navigate = useNavigate();

	const [modalVisible, setModalVisible] = useState(false);

	const userName = userStore.userInfo.name;

	const onClick: MenuProps["onClick"] = async ({ key }) => {
		switch (key) {
			case "1":
				try {
					await userStore.actions.logOut({ t: Date.now() });
				} catch (err) {
					console.error("logOut failed:", err);
				} finally {
					navigate("/login", { replace: true });
				}
				break;
			case "2":
				break;
			default:
				break;
		}
	};

	const items: MenuProps["items"] = [
		{
			key: "1",
			label: "Logout",
		},
		{
			key: "2",
			label: "update-password",
		},
	];
	return (
		<Header className="flex justify-between px-4!">
			<span>mall4j</span>
			<span>
				<ThemeModeSwitch />
				<Dropdown menu={{ items, onClick }}>
					<Button type="link" className="ml-4! p-0!">
						{userName}
					</Button>
				</Dropdown>
			</span>
		</Header>
	);
}
