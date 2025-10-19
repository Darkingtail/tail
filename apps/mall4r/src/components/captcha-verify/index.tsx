import { CaptchaType } from "@/constants/captcha-verify";
import {
	type CaptchaResponseData,
	verificationApi,
} from "@/service/api/captcha-verify";
import { aesEncrypt } from "@/utils/crypto";
import { ReloadOutlined } from "@ant-design/icons";
import { Button, Modal, message } from "antd";
import { useCallback, useEffect, useMemo, useState } from "react";
import BlockPuzzle from "./block-puzzle";
import ClickWord from "./click-word";

type CaptchaVerifyProps = {
	open: boolean;
	captchaType: CaptchaType;
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

export default function CaptchaVerify({
	open,
	captchaType,
	imgSize = { width: 310, height: 155 },
	onSuccess,
	onCancel,
}: CaptchaVerifyProps) {
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
				? aesEncrypt(pointJsonRaw, extra.secretKey)
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
						? aesEncrypt(verificationPayload, extra.secretKey)
						: verificationPayload;
					message.success("验证成功");
					onSuccess(captchaVerification);
				} else {
					message.warning(normalizeMessage(response?.repMsg, "验证失败"));
					await fetchCaptcha();
				}
			} catch (error) {
				message.error("验证失败");
				console.error(error);
				await fetchCaptcha();
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
		verifying,
		handleBlockPuzzleVerify,
		fetchCaptcha,
		onSuccess,
	]);

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
						loading={loading || verifying}
						type="text"
					/>
				</>
			}
			open={open}
			onCancel={() => {
				if (!verifying) {
					onCancel();
				}
			}}
			footer={null}
			destroyOnHidden
			confirmLoading={loading || verifying}
			width="fit-content"
			maskClosable={false}
		>
			{content}
		</Modal>
	);
}
