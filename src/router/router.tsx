import { useRoutes } from "react-router-dom";
import { routerMap } from "./routerMap";

function Router() {
	const routerTab = useRoutes(routerMap); //注册前端路由表

	return <div>{routerTab}</div>;
}

export default Router;
