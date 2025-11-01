import { Layout } from "antd";
import { Outlet } from "react-router-dom";

export default function Content() {
	return (
		<Layout.Content>
			<Outlet />
		</Layout.Content>
	);
}
