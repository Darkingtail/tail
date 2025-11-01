import loginLogo from "@/assets/img/login-logo.png";
import type { CaptchaVerifyHandle } from "@/components/captcha-verify";
import CaptchaVerify from "@/components/captcha-verify";
import { CaptchaType } from "@/constants/captcha-verify";
import useUserStoreHydrated from "@/hooks/useUserStoreHydrated";
import type { LoginFormFields } from "@/service/api/login";
import useUserStore from "@/store/userStore";
import { pwdEncrypt } from "@/utils/crypto";
import { LockOutlined, UserOutlined } from "@ant-design/icons";
import { Button, Form, Input, Layout, message } from "antd";
import { useCallback, useEffect, useRef, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";

const { Content } = Layout;

export default function Login() {
	const [form] = Form.useForm<LoginFormFields>();
	const actions = useUserStore((state) => state.actions);
	const { value: accessToken, isHydrated } = useUserStoreHydrated(
		(state) => state.userToken.accessToken,
	);
	const [captchaVisible, setCaptchaVisible] = useState(false);
	const [pendingValues, setPendingValues] = useState<LoginFormFields | null>(
		null,
	);
	const [isLogining, setIsLogining] = useState(false);
	const navigate = useNavigate();
	const captchaVerifyRef = useRef<CaptchaVerifyHandle>(null);

	const submitWithCaptcha = useCallback(
		async (values: LoginFormFields, verification: string) => {
			setIsLogining(true);
			try {
				await actions.login({
					userName: values.userName,
					passWord: pwdEncrypt(values.passWord),
					captchaVerification: verification,
				});
				message.success("登录成功");
				setPendingValues(null);
				setCaptchaVisible(false);
				navigate("/home", { replace: true });
				return true;
			} catch {
				await captchaVerifyRef.current?.refresh();
				return false;
			} finally {
				setIsLogining(false);
			}
		},
		[actions, navigate],
	);

	const handleLogin = useCallback((values: LoginFormFields) => {
		setPendingValues(values);
		setCaptchaVisible(true);
	}, []);

	useEffect(() => {
		form.setFieldsValue({
			userName: "admin",
			passWord: "123456",
		});

		const handleGlobalKeyUp = (event: KeyboardEvent) => {
			if (event.key === "Enter") {
				form.submit();
			}
		};

		document.addEventListener("keyup", handleGlobalKeyUp);
		return () => {
			document.removeEventListener("keyup", handleGlobalKeyUp);
		};
	}, [form]);

	if (!isHydrated) {
		return null;
	}

	if (accessToken) {
		return <Navigate to="/home" replace />;
	}

	return (
		<Layout>
			<Content className="relative h-screen w-screen overflow-hidden bg-[url(@/assets/img/login-bg.png)] bg-cover bg-no-repeat">
				<div className="absolute left-1/2 w-[410px] -translate-x-1/2 pt-[10%]">
					<div className="mb-[30px] text-center">
						<img className="mx-auto max-w-[50%]" src={loginLogo} alt="logo" />
					</div>
					<Form
						form={form}
						name="login"
						initialValues={{ remember: true }}
						onFinish={handleLogin}
					>
						<Form.Item<LoginFormFields>
							name="userName"
							rules={[
								{
									required: true,
									message: "账号不能为空",
								},
							]}
						>
							<Input prefix={<UserOutlined />} placeholder="账号" allowClear />
						</Form.Item>
						<Form.Item<LoginFormFields>
							name="passWord"
							rules={[{ required: true, message: "密码不能为空" }]}
						>
							<Input
								prefix={<LockOutlined />}
								type="passWord"
								placeholder="密码"
								allowClear
							/>
						</Form.Item>

						<Form.Item>
							<Button block type="primary" htmlType="submit">
								登录
							</Button>
						</Form.Item>
					</Form>
				</div>
				<div className="text=[#999] absolute bottom-[10%] w-full text-center text-xs">
					Copyright © 2019 广州市蓝海创新科技有限公司
				</div>
			</Content>
			<CaptchaVerify
				ref={captchaVerifyRef}
				open={captchaVisible}
				imgSize={{ width: 400, height: 200 }}
				captchaType={CaptchaType.BlockPuzzle}
				isLogining={isLogining}
				onSuccess={async (verification) => {
					const values = pendingValues ?? form.getFieldsValue(true);
					await submitWithCaptcha(values, verification);
				}}
				onCancel={() => {
					if (isLogining) {
						return;
					}
					setPendingValues(null);
					setCaptchaVisible(false);
				}}
			/>
		</Layout>
	);
}
