import type { CaptchaResponseData } from "@/service/api/captcha-verify";
type ClickWordProps = {
	data: CaptchaResponseData | null;
	imgSize: { width: number; height: number };
	loading: boolean;
	isLogining: boolean;
	verifying: boolean;
	onRefresh: () => Promise<void> | void;
	onSuccess: (captchaVerification: string) => void;
};

export default function ClickWord({
	data,
	imgSize,
	loading,
	isLogining,
	verifying,
	onRefresh,
	onSuccess,
}: ClickWordProps) {
	void data;
	void imgSize;
	void loading;
	void isLogining;
	void verifying;
	void onRefresh;
	void onSuccess;

	return <div />;
}
