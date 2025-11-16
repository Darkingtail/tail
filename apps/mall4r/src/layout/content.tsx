import { Layout } from "antd";
import { Outlet } from "react-router-dom";

export default function Content() {
	return (
		<Layout.Content className="bg-white p-2">
			<div className="flex h-full w-full flex-col overflow-x-hidden overflow-y-auto rounded-sm">
				<Outlet />
			</div>
		</Layout.Content>
	);
}
