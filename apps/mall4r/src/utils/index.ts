import CryptoJS from "crypto-js";

/**
 * 获取 uuid；优先使用 Web Crypto，旧环境回退到 crypto-js，再回退到 Math.random。
 */
export function getUUID(): string {
	if (
		typeof crypto !== "undefined" &&
		typeof crypto.randomUUID === "function"
	) {
		return crypto.randomUUID();
	}

	if (CryptoJS?.lib?.WordArray) {
		const wordArray = CryptoJS.lib.WordArray.random(16);
		const bytes: number[] = [];

		for (let i = 0; i < wordArray.sigBytes; i += 1) {
			const word = wordArray.words[i >>> 2];
			const byte = (word >>> (24 - (i % 4) * 8)) & 0xff;
			bytes.push(byte);
		}

		bytes[6] = (bytes[6] & 0x0f) | 0x40;
		bytes[8] = (bytes[8] & 0x3f) | 0x80;

		const hex = bytes
			.map((byte) => byte.toString(16).padStart(2, "0"))
			.join("");

		return [
			hex.slice(0, 8),
			hex.slice(8, 12),
			hex.slice(12, 16),
			hex.slice(16, 20),
			hex.slice(20),
		].join("-");
	}

	return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (char) => {
		const random = (Math.random() * 16) | 0;
		const value = char === "x" ? random : (random & 0x3) | 0x8;
		return value.toString(16);
	});
}
