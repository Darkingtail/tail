// @ts-check

import { parseArgs } from "node:util";

const { values, positionals: targets } = parseArgs({
	allowPositionals: true,
	options: {
		formats: {
			type: "string",
			short: "f",
		},
		devOnly: {
			type: "boolean",
			short: "d",
		},
		prodOnly: {
			type: "boolean",
			short: "p",
		},
		withTypes: {
			type: "boolean",
			short: "t",
		},
		sourceMap: {
			type: "boolean",
			short: "s",
		},
		release: {
			type: "boolean",
		},
		all: {
			type: "boolean",
			short: "a",
		},
		size: {
			type: "boolean",
		},
	},
});

const {
	formats,
	devOnly,
	prodOnly,
	withTypes: buildTypes,
	sourceMap,
	release: isRelease,
	all: buildAllMatching,
	size: writeSize,
} = values;

console.log("targets:", targets);

console.log("values:", values);
