import { CaptchaType } from "@/constants/captcha-verify";
import {
	type CaptchaResponseData,
	verificationApi,
} from "@/service/api/captcha-verify";
import { captchaEncrypt } from "@/utils/crypto";
import { ReloadOutlined } from "@ant-design/icons";
import { Button, Modal, message } from "antd";
import {
	forwardRef,
	useCallback,
	useEffect,
	useImperativeHandle,
	useMemo,
	useState,
} from "react";
import BlockPuzzle from "./block-puzzle";
import ClickWord from "./click-word";

type CaptchaVerifyProps = {
	open: boolean;
	captchaType: CaptchaType;
	isLogining: boolean;
	imgSize: {
		width: number;
		height: number;
	};
	onSuccess: (captchaVerification: string) => void;
	onCancel: () => void;
};

type CaptchaExtra = {
	token?: string;
	secretKey?: string;
};

const normalizeMessage = (value: unknown, fallback: string) =>
	typeof value === "string" && value.trim().length > 0 ? value : fallback;

export type CaptchaVerifyHandle = {
	refresh: () => Promise<void>;
};

const CaptchaVerify = forwardRef<CaptchaVerifyHandle, CaptchaVerifyProps>(
	(
		{
			open,
			captchaType,
			imgSize = { width: 310, height: 155 },
			isLogining,
			onSuccess,
			onCancel,
		},
		ref,
	) => {
		const [captcha, setCaptcha] = useState<CaptchaResponseData | null>(null);
		const [loading, setLoading] = useState(false);
		const [verifying, setVerifying] = useState(false);

		const fetchCaptcha = useCallback(async () => {
			setLoading(true);
			try {
				const data = await verificationApi.getCaptcha({
					captchaType,
					ts: Date.now(),
				});
				if (data.repCode === "0000") {
					setCaptcha(data);
				} else {
					throw new Error(data.repMsg ?? "Captcha unavailable");
				}
			} catch (error) {
				message.error("Failed to load captcha, please retry later.");
				console.error(error);
				setCaptcha(null);
			} finally {
				setLoading(false);
			}
		}, [captchaType]);

		useEffect(() => {
			if (open) {
				void fetchCaptcha();
			} else {
				setCaptcha(null);
				setVerifying(false);
			}
		}, [open, fetchCaptcha]);

		useImperativeHandle(
			ref,
			() => ({
				refresh: async () => {
					await fetchCaptcha();
				},
			}),
			[fetchCaptcha],
		);

		const handleBlockPuzzleVerify = useCallback(
			async (point: { x: number; y: number }) => {
				const extra = (captcha?.repData ?? {}) as CaptchaExtra;
				if (!extra.token) {
					message.error("Captcha token missing. Refresh and try again.");
					await fetchCaptcha();
					return;
				}

				const pointJsonRaw = JSON.stringify(point);
				const pointJson = extra.secretKey
					? captchaEncrypt(pointJsonRaw, extra.secretKey)
					: pointJsonRaw;

				setVerifying(true);
				try {
					const response = await verificationApi.checkCaptcha({
						captchaType: CaptchaType.BlockPuzzle,
						pointJson,
						token: extra.token,
					});

					if (response?.repCode === "0000") {
						const verificationPayload = `${extra.token}---${pointJsonRaw}`;
						const captchaVerification = extra.secretKey
							? captchaEncrypt(verificationPayload, extra.secretKey)
							: verificationPayload;
						onSuccess(captchaVerification);
					} else {
						await fetchCaptcha();
						throw new Error(
							(response?.repMsg || "Verification failed") as string,
						);
					}
				} catch (error) {
					message.error(normalizeMessage(error, "验证失败"));
					await fetchCaptcha();
					return Promise.reject(error);
				} finally {
					setVerifying(false);
				}
			},
			[captcha, fetchCaptcha, onSuccess],
		);

		const content = useMemo(() => {
			switch (captchaType) {
				case CaptchaType.BlockPuzzle:
					return (
						<BlockPuzzle
							data={captcha}
							imgSize={imgSize}
							loading={loading}
							isLogining={isLogining}
							verifying={verifying}
							onVerify={handleBlockPuzzleVerify}
						/>
					);
				case CaptchaType.ClickWord:
					return (
						<ClickWord
							data={captcha}
							imgSize={imgSize}
							loading={loading}
							isLogining={isLogining}
							verifying={verifying}
							onRefresh={fetchCaptcha}
							onSuccess={(captchaVerification) => {
								onSuccess(captchaVerification);
							}}
						/>
					);
				default:
					return null;
			}
		}, [
			captchaType,
			captcha,
			imgSize,
			loading,
			isLogining,
			verifying,
			handleBlockPuzzleVerify,
			fetchCaptcha,
			onSuccess,
		]);

		const busy = loading || verifying || isLogining;

		return (
			<Modal
				title={
					<>
						<span>请完成安全验证</span>
						<Button
							className="ant-modal-close right-[45px]!"
							icon={<ReloadOutlined />}
							onClick={() => {
								void fetchCaptcha();
							}}
							loading={busy}
							type="text"
						/>
					</>
				}
				open={open}
				onCancel={() => {
					if (!busy) {
						onCancel();
					}
				}}
				footer={null}
				destroyOnHidden
				confirmLoading={busy}
				width="fit-content"
				maskClosable={false}
			>
				{content}
			</Modal>
		);
	},
);

CaptchaVerify.displayName = "CaptchaVerify";

export default CaptchaVerify;
