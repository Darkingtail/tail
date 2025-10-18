import loginLogo from "@/assets/img/login-logo.png";
import { LockOutlined, UserOutlined } from "@ant-design/icons";
import { Button, Form, Input } from "antd";
import { useEffect, useState } from "react";
// import { getUUID } from "@/utils";
import CaptchaVerify from "@/components/captcha-verify";
import { CaptchaType } from "@/constants/captcha-verify";

type LoginFormFields = {
	userName: string;
	password: string;
};

export function Login() {
	const [form] = Form.useForm<LoginFormFields>();

	const [captchaVisible, setCaptchaVisible] = useState(false);

	const handleLogin = (values: LoginFormFields) => {
		console.log("Valid and values of form: ", values);
		setCaptchaVisible(true);
	};

	useEffect(() => {
		form.setFieldsValue({
			userName: "admin",
			password: "12312312",
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
							name="password"
							rules={[{ required: true, message: "密码不能为空" }]}
						>
							<Input
								prefix={<LockOutlined />}
								type="password"
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
				onSuccess={() => {}}
				onCancel={() => setCaptchaVisible(false)}
			/>
		</>
	);
}
