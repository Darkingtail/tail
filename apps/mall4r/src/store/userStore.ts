import {
	type LoginRequestPayload,
	type LoginResponse,
	type LogoutRequestPayload,
	loginApi,
} from "@/service/api/login";
import { type UserInfo, userApi } from "@/service/api/user";
import Cookies from "js-cookie";
import { create } from "zustand";
import { createJSONStorage, devtools, persist } from "zustand/middleware";
import useRouteStore from "./routerStore";

const INITIAL_USER_INFO: UserInfo = {
	id: 0,
	username: "",
	userId: "",
	shopId: "",
	mobile: "",
};

const INITIAL_USER_TOKEN: Partial<LoginResponse> = {};

type UserStore = {
	userInfo: Partial<UserInfo>;
	authorities: string[];
	userToken: Partial<LoginResponse>;
	Authorization: string;
	// 浣跨敤 actions 鍛藉悕绌洪棿鏉ュ瓨鏀炬墍鏈夌殑 action
	actions: {
		login: (form: LoginRequestPayload) => Promise<void>;
		logOut: (data: LogoutRequestPayload) => Promise<void>;
		setUserInfo: (userInfo: UserInfo) => void;
		setUserToken: (token: LoginResponse) => void;
		setAuthorities: (authorities: string[]) => void;
		setAuthorization: (Authorization: string) => void;
		clearUserToken: () => void;
		clearUserInfo: () => void;
	};
};

export type UserStoreState = UserStore;

/*

useRouteStore 鏄?zustand 杩斿洖鐨勨€渉ook 褰㈡€佲€?store锛孯eact 浼氭妸瀹冨綋浣滀竴涓?Hook 鏉?
  澶勭悊銆傛墍浠ワ細

  - 浠讳綍 useXXX Hook锛堝寘鎷?zustand 鐨勶級閮藉彧鑳藉湪 React 缁勪欢鎴栬€呭叾浠?Hook 閲岃皟鐢紱
    浣犲湪 create() 鐨勫伐鍘傚嚱鏁伴噷鍘?useRouteStore()锛岀浉褰撲簬鍦ㄦ櫘閫氬嚱鏁伴噷璋冪敤 Hook锛?
    React 鐩存帴鎶ラ敊銆?
  - 鍗充究涓嶆姤閿欙紝useRouteStore() 杩斿洖鐨勬槸褰撳墠璁㈤槄鐨勫垏鐗囷紝瀹冧細琚攣鍦ㄥ垱寤烘椂鐨勯棴鍖?
    閲岋紝鍚庣画鐘舵€佹洿鏂版嬁涓嶅埌锛堟案杩滄槸鏃у€硷級銆?
  - store 涔嬮棿杩欎箞浜掕皟锛岃繕寰堝鏄撳舰鎴愬惊鐜緷璧栵細userStore 閲?import
    useRouteStore锛宺outerStore 鍙堥棿鎺ュ紩 userStore锛屾ā鍧楀垵濮嬪寲灏辨閿佷簡銆?

  Zustand 瀹樻柟鐨勮法 store 鐢ㄦ硶锛屾槸鍒╃敤杩斿洖 hook 涓婃寕鐫€鐨勯潤鎬佹柟娉曪紝渚嬪锛?

  const routeActions = useRouteStore.getState().actions;
  routeActions.setMenuList(...);

  getState()銆乻etState()銆乻ubscribe() 杩欎簺閮戒笉瑙﹀彂 React Hook 鐨勯檺鍒讹紝涔熶笉浼氶櫡鍏?
  闂寘/寰幆渚濊禆鐨勯棶棰樸€備繚鎸佽繖绉嶆柟寮忓氨 OK 浜嗐€?

	create() 杩斿洖鐨?useRouteStore 鏈川涓婂氨鏄竴涓?React Hook锛氬畠鍐呴儴瑕佽皟鐢?
  useSyncExternalStore 鏉ユ妸鐘舵€佽闃呭埌缁勪欢鐢熷懡鍛ㄦ湡銆傛墍浠ヤ綘涓€鏃﹀湪缁勪欢澶栨墽琛?
  useRouteStore()锛孯eact 鍦ㄨ繍琛屾椂灏变細鎶涘嚭 鈥淚nvalid hook call鈥濃€斺€斾笉鏄洜涓哄悕瀛楀彨
  use锛岃€屾槸鍥犱负鐪熺殑璋冪敤浜?Hook 鍗翠笉鍦ㄧ粍浠?鑷畾涔?Hook 閲屻€俥slint 鐨?rules-of-
  hooks 涔嬫墍浠ヤ篃鎶ヨ锛屾槸鍥犱负瀹冨彧闈犲懡鍚嶇害瀹氭潵闈欐€佹鏌ワ紝鐪嬪埌 useRouteStore() 鐨勮皟
  鐢ㄥ氨榛樿浣犲湪鐢?Hook锛屼袱杈归厤鍚堢‘淇濇垜浠笉浼氬湪閿欑殑鍦烘櫙涓嬭皟鐢ㄣ€?



*/

const useUserStore = create<UserStore>()(
	devtools(
		persist(
			(set, get) => ({
				userInfo: { ...INITIAL_USER_INFO },
				userToken: { ...INITIAL_USER_TOKEN },
				authorities: [],
				Authorization: "",
				actions: {
					login: async (form: LoginRequestPayload) => {
						try {
							const response = await loginApi.login(form);
							const userInfo = await userApi.fetchUserInfo({ t: Date.now() });
							const navInfo = await userApi.fetchNavInfo({ t: Date.now() });
							get().actions.setUserToken(response);
							get().actions.setAuthorization(response.accessToken ?? "");
							get().actions.setUserInfo(userInfo);
							get().actions.setAuthorities(navInfo.authorities);
							/* 	1. 路由对象里有函数，无法持久化
											buildRoutesFromMenu 生成的 RouteObject 会包含 lazy、element 等函数。把这些放到 store 并持久化到 localStorage 会因为
											JSON 序列化而丢失函数，刷新后就变成“没有 component 的空路由”，导致 404。只存纯数据（menuList）更安全。
										2. 在组件层算路由，随用随建
											sidebar、App 等组件根据最新的 menuList 调 buildRoutesFromMenu，能确保每次渲染拿到干净的路由树，不受缓存影响。也就没
											有“刷新后菜单/路由丢失”的问题。
										3. store 保持简单、易于同步
											routerStore 只负责存取菜单列表和是否加载完成，避免担心函数在 hydrate 后不一致。同时也让其他组件想要路由时可以直接在
											本地用 buildRoutesFromMenu 生成，逻辑上更可控。
							*/
							const routeActions = useRouteStore.getState().actions;
							routeActions.setMenuList(navInfo.menuList);
							Cookies.set("Authorization", response.accessToken ?? "");
							return Promise.resolve();
						} catch (error) {
							return Promise.reject(error);
						}
					},
					logOut: async (data: LogoutRequestPayload) => {
						try {
							await loginApi.logOut(data);
						} catch {
							// 鍗充娇鐧诲嚭鎺ュ彛璇锋眰澶辫触涔熺户缁竻鐞嗘湰鍦扮姸鎬?
						} finally {
							get().actions.clearUserToken();
							get().actions.clearUserInfo();
							const routeActions = useRouteStore.getState().actions;
							routeActions.reset();
							Cookies.remove("Authorization");
						}
					},
					setAuthorities: (authorities) => {
						set({ authorities });
					},
					setUserInfo: (userInfo) => {
						set({ userInfo });
					},
					setUserToken: (userToken) => {
						set({ userToken });
					},
					setAuthorization: (Authorization) => {
						set({ Authorization });
					},
					clearUserToken() {
						set({ userToken: { ...INITIAL_USER_TOKEN }, Authorization: "" });
					},
					clearUserInfo() {
						set({ userInfo: { ...INITIAL_USER_INFO } });
					},
				},
			}),
			{
				name: "userStore", // name of the item in the storage (must be unique)
				storage: createJSONStorage(() => localStorage), // (optional) by default, 'localStorage' is used
				partialize: (state) => ({
					userInfo: state.userInfo,
					userToken: state.userToken,
					Authorization: state.Authorization,
				}),
			},
		),
	),
);

export default useUserStore;
