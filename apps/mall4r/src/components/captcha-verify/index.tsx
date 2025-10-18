import { CaptchaType } from "@/constants/captcha-verify";
import {
	verificationApi,
	type CaptchaResponseData,
} from "@/service/api/captcha-verify";
import { ReloadOutlined } from "@ant-design/icons";
import { Button, Modal } from "antd";
import { useCallback, useMemo, useState } from "react";
import BlockPuzzle from "./block-puzzle";
import ClickWord from "./click-word";

type CaptchaVerifyProps = {
	open: boolean;
	captchaType: CaptchaType;
	imgSize: {
		width: number;
		height: number;
	};
	onSuccess: () => void;
	onCancel: () => void;
};

export default function CaptchaVerify({
	open,
	captchaType,
	imgSize = { width: 310, height: 155 },
	onSuccess,
	onCancel,
}: CaptchaVerifyProps) {
	const [captcha, setCaptcha] = useState<CaptchaResponseData | null>(null);
	const [loading, setLoading] = useState(false);

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
				throw new Error("captcha is not valid");
			}
		} finally {
			setLoading(false);
		}
	}, [captchaType]);

	const handleAfterOpenChange = useCallback(
		(isOpen: boolean) => {
			if (isOpen) {
				void fetchCaptcha();
			} else {
				setCaptcha(null);
			}
		},
		[fetchCaptcha],
	);

	const captchaRenderer = useMemo(() => {
		switch (captchaType) {
			case CaptchaType.BlockPuzzle:
				return (
					<BlockPuzzle
						data={captcha}
						imgSize={imgSize}
						loading={loading}
						onRefresh={fetchCaptcha}
						onSuccess={onSuccess}
					/>
				);
			case CaptchaType.ClickWord:
				return (
					<ClickWord
						data={captcha}
						imgSize={imgSize}
						loading={loading}
						onRefresh={fetchCaptcha}
						onSuccess={onSuccess}
					/>
				);
			default:
				return null;
		}
	}, [captchaType, captcha, imgSize, loading, fetchCaptcha, onSuccess]);

	return (
		<Modal
			title={
				<>
					<span>请完成安全验证</span>
					<Button
						className="ant-modal-close right-[45px]!"
						icon={<ReloadOutlined />}
						onClick={fetchCaptcha}
						loading={loading}
						type="text"
					/>
				</>
			}
			open={open}
			onCancel={onCancel}
			footer={null}
			destroyOnHidden
			afterOpenChange={handleAfterOpenChange}
			confirmLoading={loading}
			width="fit-content"
			maskClosable={false}
		>
			{captchaRenderer}
		</Modal>
	);
}
