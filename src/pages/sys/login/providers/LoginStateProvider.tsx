import {
	type PropsWithChildren,
	createContext,
	useContext,
	useMemo,
	useState,
} from "react";

// 登录状态枚举
export enum LoginStateEnum {
	LOGIN = 0,
	REGISTER = 1,
	RESET_PASSWORD = 2,
	MOBILE = 3,
	QR_CODE = 4,
}

// 登录
interface LoginStateContextType {
	loginState: LoginStateEnum;
	setLoginState: (loginState: LoginStateEnum) => void;
	backToLogin: () => void;
}

// 创建上下文，用于在组件树中传递登录状态，切换展示不同的登录组件
const LoginStateContext = createContext<LoginStateContextType>({
	loginState: LoginStateEnum.LOGIN,
	setLoginState: () => {},
	backToLogin: () => {},
});

export function useLoginStateContext() {
	const context = useContext(LoginStateContext);
	return context;
}

export function LoginStateProvider({ children }: PropsWithChildren) {
	// 登录状态，后面主要用于登录类型不同切换不同的UI组件，与 LoginStateEnum 对应
	const [loginState, setLoginState] = useState(LoginStateEnum.LOGIN);

	// 返回登录页
	function backToLogin() {
		setLoginState(LoginStateEnum.LOGIN);
	}

	// 将loginState, setLoginState, backToLogin三个变量传递到子组件中
	// biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
	const value: LoginStateContextType = useMemo(
		() => ({ loginState, setLoginState, backToLogin }),
		[loginState],
	);

	return (
		<LoginStateContext.Provider value={value}>
			{children}
		</LoginStateContext.Provider>
	);
}
