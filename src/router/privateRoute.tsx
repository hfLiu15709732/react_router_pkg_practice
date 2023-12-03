import { message } from "antd";
import { ReactElement, useEffect } from "react";
import { getToken } from "../tools/auth";
import { useNavigate } from "react-router-dom";

interface Props {
	children: ReactElement;
}
const PrivateRoute = ({ children }: Props) => {
	const navigator = useNavigate();

	// 对比时间戳是否超过48小时
	function isPast48Hours(timestamp: number): boolean {
		// 获取当前时间戳
		const currentTimestamp = Math.floor(Date.now() / 1000);

		// 计算时间差，单位为秒
		const timeDifference = currentTimestamp - timestamp;

		// 定义48小时的秒数
		const hours48InSeconds = 48 * 60 * 60;

		// 判断时间差是否超过48小时
		return timeDifference > hours48InSeconds;
	}

	useEffect(() => {
		try {
			const token: any = getToken();
			const tokenObj = JSON.parse(token);
			if (tokenObj === null || isPast48Hours(tokenObj.expired)) {
				message.warning("token过期,请重新登录");
				navigator(`/login`);
			}
		} catch (error) {
			message.warning("token过期,请重新登录");
			navigator(`/login`);
		}
	}, []);
	return <>{children}</>;
};

export default PrivateRoute;
