import ThemeModeSwitch from "@/components/theme-mode-switch";
import useUserStoreHydrated from "@/hooks/useUserStoreHydrated";
import useUserStore from "@/store/userStore";
import { ExclamationCircleFilled } from "@ant-design/icons";
import type { MenuProps } from "antd";
import { Button, Dropdown, Layout, Modal, theme } from "antd";
import { useCallback } from "react";
import { useNavigate } from "react-router-dom";

const { Header } = Layout;

export default function NavBar() {
	const { token } = theme.useToken();
	const actions = useUserStore((state) => state.actions);
	const { value: username } = useUserStoreHydrated(
		(state) => state.userInfo.username ?? "",
	);
	const [modal, modalContextHolder] = Modal.useModal();
	const navigate = useNavigate();

	const handleLogout = useCallback(() => {
		modal.confirm({
			title: "退出登录",
			icon: <ExclamationCircleFilled />,
			content: "确定要执行退出操作吗？",
			cancelText: "取消",
			okText: "确定",
			onOk: async () => {
				try {
					await actions.logOut({ t: Date.now() });
					navigate("/login", { replace: true });
				} catch (error) {
					console.error("logOut failed:", error);
				}
			},
		});
	}, [actions, modal, navigate]);

	const onClick: MenuProps["onClick"] = useCallback(
		({ key }: { key: string }) => {
			switch (key) {
				case "1":
					// TODO: 打开修改密码弹窗
					break;
				case "2":
					handleLogout();
					break;
				default:
					break;
			}
		},
		[handleLogout],
	);

	const items: MenuProps["items"] = [
		{
			key: "1",
			label: "修改密码",
		},
		{
			key: "2",
			label: "退出",
		},
	];

	return (
		<>
			{modalContextHolder}
			<Header
				className="flex h-12 items-center justify-between border-b px-4!"
				style={{
					borderColor: token.colorSplit,
					background: token.colorBgContainer,
				}}
			>
				<span className="text-base font-bold">mall4j</span>
				<span>
					<ThemeModeSwitch />
					<Dropdown menu={{ items, onClick }}>
						<Button type="link" className="ml-4! p-0!">
							{username}
						</Button>
					</Dropdown>
				</span>
			</Header>
		</>
	);
}
