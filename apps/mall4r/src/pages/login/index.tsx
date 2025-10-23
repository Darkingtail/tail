import loginLogo from "@/assets/img/login-logo.png";
import CaptchaVerify from "@/components/captcha-verify";
import { CaptchaType } from "@/constants/captcha-verify";
import type { LoginFormFields } from "@/service/api/login";
import { loginApi } from "@/service/api/login";
import { pwdEncrypt } from "@/utils/crypto";
import { LockOutlined, UserOutlined } from "@ant-design/icons";
import { Button, Form, Input } from "antd";
import { useCallback, useEffect, useState } from "react";

export function Login() {
	const [form] = Form.useForm<LoginFormFields>();
	const [captchaVisible, setCaptchaVisible] = useState(false);
	const [pendingValues, setPendingValues] = useState<LoginFormFields | null>(
		null,
	);

	const submitWithCaptcha = useCallback(
		(values: LoginFormFields, verification: string) => {
			console.log("submit login with captcha:", {
				...values,
				captchaVerification: verification,
			});
			loginApi
				.login({
					userName: values.userName,
					passWord: pwdEncrypt(values.passWord),
					captchaVerification: verification,
				})
				.then((res) => {
					console.log("login response:", res);
				});
		},
		[],
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

	return (
		<>
			<div className="relative h-screen w-screen overflow-hidden bg-[url(@/assets/img/login-bg.png)] bg-cover bg-no-repeat">
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
					Copyright ©
				</div>
			</div>
			<CaptchaVerify
				open={captchaVisible}
				imgSize={{ width: 400, height: 200 }}
				captchaType={CaptchaType.BlockPuzzle}
				onSuccess={(verification) => {
					const values = pendingValues ?? form.getFieldsValue(true);
					submitWithCaptcha(values, verification);
					setPendingValues(null);
					setCaptchaVisible(false);
				}}
				onCancel={() => {
					setPendingValues(null);
					setCaptchaVisible(false);
				}}
			/>
		</>
	);
}
