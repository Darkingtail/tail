import CryptoJS from "crypto-js";

const DEFAULT_AES_KEY = "XwKsGlMcdPMEhR1B";

export function aesEncrypt(value: string, key: string = DEFAULT_AES_KEY): string {
	const parsedKey = CryptoJS.enc.Utf8.parse(key);
	const parsedValue = CryptoJS.enc.Utf8.parse(value);

	return CryptoJS.AES.encrypt(parsedValue, parsedKey, {
		mode: CryptoJS.mode.ECB,
		padding: CryptoJS.pad.Pkcs7,
	}).toString();
}
