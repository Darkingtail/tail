import type { CaptchaResponseData } from "@/service/api/captcha-verify";

type ClickWordProps = {
	data: CaptchaResponseData | null;
	imgSize: { width: number; height: number };
	loading: boolean;
	onRefresh: () => Promise<void>;
	onSuccess: () => void;
};

export default function ClickWord({
	data,
	imgSize,
	loading,
	onRefresh,
	onSuccess,
}: ClickWordProps) {
	return <div className=""></div>;
}
