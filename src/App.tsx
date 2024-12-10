import Logo from "@/assets/images/logo.svg";
import Router from "@/router/index";
import AntdConfig from "@/theme/antd";
import { App as AntdApp } from "antd";
import { Helmet } from "react-helmet-async";
import { MotionLazy } from "./components/animate/motion-lazy";
import Toast from "./components/toast";

function App() {
	const APP_TITLE = import.meta.env.VITE_GLOB_APP_TITLE;
	return (
		<AntdConfig>
			<AntdApp>
				<MotionLazy>
					<Helmet>
						<title>{APP_TITLE}</title>
						<link rel="icon" href={Logo} />
					</Helmet>
					<Toast />
					<Router />
				</MotionLazy>
			</AntdApp>
		</AntdConfig>
	);
}

export default App;
