import { QRCode } from "antd";
import { useTranslation } from "react-i18next";

import { ReturnButton } from "./components/ReturnButton";
import {
	LoginStateEnum,
	useLoginStateContext,
} from "./providers/LoginStateProvider";

function QrCodeFrom() {
	const { t } = useTranslation();
	const { loginState, backToLogin } = useLoginStateContext();

	if (loginState !== LoginStateEnum.QR_CODE) return null;
	return (
		<>
			<div className="mb-4 text-2xl font-bold xl:text-3xl flex justify-between items-center">
				<div className="flex-1">{t("sys.login.qrSignInFormTitle")}</div>
				<div className="w-auto">
					<ReturnButton onClick={backToLogin} />
				</div>
			</div>
			<div className="flex w-full flex-col items-center justify-center">
				<QRCode
					size={300}
					errorLevel="H"
					value="https://ant.design/"
					icon="https://gw.alipayobjects.com/zos/rmsportal/KDpgvguMpGfqaHPjicRK.svg"
				/>
				<p className="my-4 text-sm">{t("sys.login.scanSign")}</p>
			</div>
		</>
	);
}

export default QrCodeFrom;
