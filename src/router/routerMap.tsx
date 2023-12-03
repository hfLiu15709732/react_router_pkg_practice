import { Navigate } from "react-router-dom";
import Login from "../pages/login";
import User from "../pages/User";
import Community from "../pages/Community";
import Book from "../pages/Book";
import Layout from "../layout";
import PrivateRoute from "./privateRoute";
export const routerMap = [
	{
		path: "/login",
		element: <Login />,
	},
	// {
	// 	index: true,
	// 	element: <Navigate to="/login" />,
	// }, //路由重定向到登录界面
	{
		path: "/",
		element: (
			<PrivateRoute>
				<Layout />
			</PrivateRoute>
		),
		children: [
			{
				path: "/user",
				element: <User />,
			},
			{
				path: "/community",
				element: <Community />,
			},
			{
				path: "/book",
				element: <Book />,
			},
		],
	},
	{
		path: "*",
		element: <Navigate to="/login" />,
	}, //其他没有被注册过的路径统一重定位到login
];
