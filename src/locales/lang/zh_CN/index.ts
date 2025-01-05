import _mock from "./_mock.json";
import common from "./common.json";
import sys from "./sys.json";

export default {
	...common,
	...sys,
	..._mock,
};
