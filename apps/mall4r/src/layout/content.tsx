import { Layout, theme } from "antd";
import { Outlet } from "react-router-dom";

export default function Content() {
	const { token } = theme.useToken();

	return (
		<Layout.Content className="p-2" style={{ background: token.colorBgLayout }}>
			<div className="h-full w-full overflow-x-hidden overflow-y-auto rounded-sm bg-[color:var(--ant-color-bg-container)]">
				<Outlet />
			</div>
		</Layout.Content>
	);
}
