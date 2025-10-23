import CryptoJS from "crypto-js";

const DEFAULT_AES_KEY = "XwKsGlMcdPMEhR1B";

export function captchaEncrypt(
	value: string,
	key: string = DEFAULT_AES_KEY,
): string {
	const parsedKey = CryptoJS.enc.Utf8.parse(key);
	const parsedValue = CryptoJS.enc.Utf8.parse(value);

	return CryptoJS.AES.encrypt(parsedValue, parsedKey, {
		mode: CryptoJS.mode.ECB,
		padding: CryptoJS.pad.Pkcs7,
	}).toString();
}

export function pwdEncrypt(value: string): string {
	const keyStr = "-mall4j-password"; // 解密用的key
	const time = Date.now();

	const key = CryptoJS.enc.Utf8.parse(keyStr);
	const srcs = CryptoJS.enc.Utf8.parse(time + value); // 加密方式: 时间戳 + 密文

	return CryptoJS.AES.encrypt(srcs, key, {
		mode: CryptoJS.mode.ECB,
		padding: CryptoJS.pad.Pkcs7,
	}).toString();
}
