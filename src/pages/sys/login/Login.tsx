import LocalePicker from "@/components/locale-picker";
import { useUserToken } from "@/store/userStore";
import { Layout, Typography } from "antd";
import { useTranslation } from "react-i18next";
import { Navigate } from "react-router-dom";
import LoginForm from "./LoginForm";
import MobileForm from "./MobileForm";
import QrCodeFrom from "./QrCodeForm";
import RegisterForm from "./RegisterForm";
import ResetForm from "./ResetForm";
import { LoginStateProvider } from "./providers/LoginStateProvider";

const { VITE_APP_HOMEPAGE: HOMEPAGE } = import.meta.env;

function Login() {
	const { t } = useTranslation();
	const token = useUserToken();
	// const { colorBgElevated } = useThemeToken();

	// 判断用户是否有权限
	if (token.accessToken) {
		// 如果有授权，则跳转到首页
		return <Navigate to={HOMEPAGE} replace />;
	}

	// const gradientBg = Color(colorBgElevated).alpha(0.9).toString();
	// const bg = `linear-gradient(${gradientBg}, ${gradientBg}) center center / cover no-repeat,url(${Overlay2})`;

	return (
		<Layout className="relative flex !min-h-screen !w-full !flex-row">
			<div className="absolute right-2 top-0">
				<LocalePicker />
			</div>

			<div className="m-auto flex !h-screen w-full max-w-[480px] flex-col justify-center px-[16px] lg:px-[64px]">
				<LoginStateProvider>
					<LoginForm />
					<MobileForm />
					<QrCodeFrom />
					<RegisterForm />
					<ResetForm />
				</LoginStateProvider>

				<Typography.Text className="flex flex-row gap-[16px] text-2xl justify-center mt-8">
					{t("sys.login.signInSecondTitle")}
				</Typography.Text>
			</div>
		</Layout>
	);
}
export default Login;
