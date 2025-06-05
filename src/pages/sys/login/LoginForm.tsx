import { DEFAULT_USER, TEST_USER } from "@/_mock/assets";
import type { SignInReq } from "@/api/services/userService";
import Logo from "@/assets/images/logo.svg"; // vite 会自动处理 svg 文件，将其视为一个模块
import { useSignIn } from "@/store/userStore";
import ProTag from "@/theme/antd/components/tag";
import { useThemeToken } from "@/theme/hooks";
import {
	Alert,
	Button,
	Checkbox,
	Col,
	Divider,
	Form,
	Input,
	Row,
	Tooltip,
} from "antd";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { AiFillGithub } from "react-icons/ai";

import {
	LoginStateEnum,
	useLoginStateContext,
} from "./providers/LoginStateProvider";

function LoginForm() {
	const { t } = useTranslation();
	const themeToken = useThemeToken();
	const [loading, setLoading] = useState(false);

	const { loginState, setLoginState } = useLoginStateContext();
	const signIn = useSignIn(); // 登陆函数，在函数中进行路由重定向

	if (loginState !== LoginStateEnum.LOGIN) return null; // login form only show when loginState is LOGIN

	const handleFinish = async ({ username, password }: SignInReq) => {
		setLoading(true);
		try {
			await signIn({ username, password });
		} finally {
			setLoading(false);
		}
	};
	return (
		<>
			<img
				className="max-w-[48px] xl:max-w-[48px] mx-auto mb-6"
				src={Logo}
				alt=""
			/>
			<div className="mb-10 text-2xl font-bold xl:text-3xl text-center">
				{t("sys.login.signInFormTitle")}
			</div>
			<Form
				name="login"
				size="large"
				initialValues={{
					remember: true,
					username: DEFAULT_USER.username,
					password: DEFAULT_USER.password,
				}}
				onFinish={handleFinish}
			>
				<div className="mb-8 flex flex-col">
					<Alert
						type="success"
						description={
							<div className="flex flex-col">
								<div className="flex">
									<ProTag className="flex-shrink-0">
										{/* {t("sys.login.userName")} */}
										Admin :
									</ProTag>
									<strong
										className="ml-1"
										style={{ color: themeToken.colorInfoTextHover }}
									>
										<span>{DEFAULT_USER.username}</span>
									</strong>
									<ProTag className="flex-shrink-0">
										{t("sys.login.password")}:
									</ProTag>
									<strong
										className=" ml-1"
										style={{ color: themeToken.colorInfoTextHover }}
									>
										{DEFAULT_USER.password}
									</strong>
								</div>

								<div className="flex mt-2">
									<ProTag className="flex-shrink-0">Test :</ProTag>
									<strong
										className="ml-1"
										style={{ color: themeToken.colorInfoTextHover }}
									>
										<span>{TEST_USER.username}</span>
									</strong>
									<ProTag className="flex-shrink-0">
										{t("sys.login.password")}:
									</ProTag>
									<strong
										className=" ml-1"
										style={{ color: themeToken.colorInfoTextHover }}
									>
										{TEST_USER.password}
									</strong>
								</div>
							</div>
						}
						showIcon
					/>
				</div>

				<Form.Item
					name="username"
					rules={[
						{ required: true, message: t("sys.login.accountPlaceholder") },
					]}
				>
					<Input placeholder={t("sys.login.userName")} />
				</Form.Item>
				<Form.Item
					name="password"
					rules={[
						{ required: true, message: t("sys.login.passwordPlaceholder") },
					]}
				>
					<Input.Password
						type="password"
						placeholder={t("sys.login.password")}
					/>
				</Form.Item>
				<Form.Item>
					<Row align="middle">
						<Col span={12}>
							<Form.Item name="remember" valuePropName="checked" noStyle>
								<Checkbox>{t("sys.login.rememberMe")}</Checkbox>
							</Form.Item>
						</Col>
						<Col span={12} className="text-right">
							<Button
								type="link"
								className="!underline"
								onClick={() => setLoginState(LoginStateEnum.RESET_PASSWORD)}
								size="small"
							>
								{t("sys.login.forgetPassword")}
							</Button>
						</Col>
					</Row>
				</Form.Item>
				<Form.Item>
					<Button
						type="primary"
						htmlType="submit"
						className="w-full"
						loading={loading}
					>
						{t("sys.login.loginButton")}
					</Button>
				</Form.Item>

				<Row align="middle" gutter={8}>
					<Col span={9} flex="1">
						<Button
							className="w-full !text-sm"
							onClick={() => setLoginState(LoginStateEnum.MOBILE)}
						>
							{t("sys.login.mobileSignInFormTitle")}
						</Button>
					</Col>
					<Col span={9} flex="1">
						<Button
							className="w-full !text-sm"
							onClick={() => setLoginState(LoginStateEnum.QR_CODE)}
						>
							{t("sys.login.qrSignInFormTitle")}
						</Button>
					</Col>
					<Col
						span={6}
						flex="1"
						onClick={() => setLoginState(LoginStateEnum.REGISTER)}
					>
						<Button className="w-full !text-sm">
							{t("sys.login.signUpFormTitle")}
						</Button>
					</Col>
				</Row>

				<Divider className="!text-xs">{t("sys.login.otherSignIn")}</Divider>

				<div className="flex cursor-pointer justify-around text-2xl">
					<Tooltip title="Github">
						<AiFillGithub
							onClick={() => window.open("https://github.com/Darkingtail/tail")}
						/>
					</Tooltip>
					{/* <AiFillWechat />
					<AiFillGoogleCircle /> */}
				</div>
			</Form>
		</>
	);
}

export default LoginForm;
