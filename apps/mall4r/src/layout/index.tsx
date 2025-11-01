import useUserStoreHydrated from "@/hooks/useUserStoreHydrated";
import { LoadingOutlined } from "@ant-design/icons";
import { Layout as AntdLayout, Spin } from "antd";
import Content from "./content";
import NavBar from "./navbar";
import SideBar from "./sidebar";

export default function Layout() {
	const { isHydrated } = useUserStoreHydrated(() => null);
	return !isHydrated ? (
		<Spin
			tip="Loading..."
			size="large"
			fullscreen
			indicator={<LoadingOutlined style={{ fontSize: 24 }} spin />}
		/>
	) : (
		<AntdLayout className="h-screen w-screen">
			<NavBar />
			<AntdLayout>
				<SideBar />
				<Content />
			</AntdLayout>
		</AntdLayout>
	);
}
