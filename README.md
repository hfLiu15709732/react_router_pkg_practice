# React Router V6 项目中的路由鉴权封装实践（Hooks）

## 1. 前言

### 1.1 路由封装的好处

- **路由鉴权集中管理：** 封装路由组件允许你集中管理路由鉴权逻辑。这意味着在一个地方处理用户是否有权限访问某个路由，而不是在每个页面或组件中重复相同的鉴权逻辑。这有助于保持一致性，并简化了对路由鉴权的维护和更新。

- **提高代码复用性：** 封装路由组件可以促进代码的复用。你可以将通用的路由配置、鉴权逻辑或其他功能抽象为可复用的组件，以便在整个应用程序中多次使用。这降低了重复编写相似代码的需求，提高了代码复用性。

- **易于扩展：** 当项目需求变化时，封装的路由组件使得扩展和调整路由配置变得更加容易。你可以轻松地添加新的路由或更改现有路由的配置，而不会影响到整个应用程序的其他部分。

- **更清晰的项目结构：** 路由组件的再封装可以帮助建立清晰的项目结构。通过将路由相关的代码放在专用的文件或文件夹中，项目的结构更容易理解和导航，减少了代码文件的混杂性。

### 1.2 整体项目结构

```apl
- src
  - layout
      - index.ts  # UI主框架（鉴权之后才能进的）
  - tools
      - auth.ts   # 权限相关工具文件
  - router
      - router.tsx  # 路由组件注册
      - routerMap.tsx  # 路由表构建
      - privateRouter.ts  # 权限路由组件
      - router.ts  # 路由组件注册
  - pages #（下面都是随便弄的，要对自己的需求）
      - community.tsx  # 社区压面
      - login.tsx  # 登录界面
      - user.ts  # 用户界面
      - book.ts  # 书籍列表界面
```

## 2. 前期准备工作

### 2.1 安装依赖

```shell
 pnpm add antd --save # 因为是一个小案例，所以做了基础的UI开发
 pnpm add react-router-dom --save #（现在默认是V6版本的路由）
```

### 2.2 编写工具文件

```tsx
/**
 * 设置token
 * @param token
 * @returns
 */
export const setToken = (token: string) =>
	window.localStorage.setItem("auth_token", token);
/**
 * 获取token
 * @returns
 */
export const getToken = () => window.localStorage.getItem("auth_token");
/**
 * 获取token
 * @returns
 */
export const clearToken = () => window.localStorage.removeItem("auth_token");
```

### 2.3 编写具体页面组件

> **仅仅以社区列表这个组件为例，其实就是每个具体页面准备好**

```tsx
import React from "react";

export default function Community() {
	return <div>社区列表界面</div>;
}
```

## 3. 路由组件的开发

### 3.1 配置项目路由的根组件

```tsx
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import { BrowserRouter } from "react-router-dom";

ReactDOM.createRoot(document.getElementById("root")!).render(
	<React.StrictMode>
		<BrowserRouter>
			<App />
		</BrowserRouter>
	</React.StrictMode>
	//这里配置的是BrowserRouter，根据需要，可选择这个或者HashRouter，两者差别这里就略过了，可以看看router v6基础篇或其他文章
);
```

### 3.2 守卫路由的编写

> 其实就是做了一个基本的`鉴权与过期`处理，**自己项目如果有更多的需求，就在 try 里面加就可以了**

```tsx
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
```

### 3.3 路由映射表的编写

> 这里没有直接用<Route/>组件爱你包裹，而是先用`js`对象形式维护了一套**路由表数据**，方便其他诸如: `菜单/目录`等组件的复用

```tsx
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
```

### 3.4 路由注册的编写

> 其实就是将原先的路由表数据注册为路由组件

```tsx
import { useRoutes } from "react-router-dom";
import { routerMap } from "./routerMap";

function Router() {
	const routerTab = useRoutes(routerMap); //注册前端路由表

	return <div>{routerTab}</div>;
}

export default Router;
```

### 3.5 路由渲染

```tsx
import Router from "./router/router";

function App() {
	return (
		<>
			<Router />
		</>
	);
}

export default App;
```

## 4. 组件内应用

### 4.1 Layout 组件应用测试

> Layout 布局组件，一个简单的小 Demo 来测试路由正确性，他会被权限组件`<PrivateRoute/>`包裹,受到保护

```tsx
import { Tabs, TabsProps } from "antd";
import React from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { clearToken } from "../tools/auth";
export default function Layout() {
	const navigator = useNavigate();
	const items: TabsProps["items"] = [
		{
			key: "book",
			label: "书籍列表页面",
		},
		{
			key: "community",
			label: "社区列表页面",
		},
		{
			key: "user",
			label: "用户列表页面",
		},
		{
			key: "login",
			label: "退出登录",
		},
	];
	const handleChangeRoute = (value: string) => {
		if (value === "login") {
			clearToken();
		}
		navigator(`/${value}`);
	};
	return (
		<>
			<div style={{ maxWidth: "500px", margin: "0 auto" }}>
				<div
					style={{
						display: "flex",
						alignItems: "center",
						justifyContent: "center",
					}}
				>
					<Tabs
						defaultActiveKey="community"
						size={"large"}
						items={items}
						onChange={(value) => {
							handleChangeRoute(value);
						}}
					/>
				</div>
				<div
					style={{
						marginTop: "50px",
						display: "flex",
						alignItems: "center",
						justifyContent: "center",
					}}
				>
					<Outlet />
				</div>
			</div>
		</>
	);
}
```

### 4.2 登录组件的应用测试

> Login 登录组件，一个简单的小 Demo 来测试路由正确性，他不会被权限组件`<PrivateRoute/>`包裹,可以随意进入

```tsx
import { Button } from "antd";
import React from "react";
import { setToken } from "../../tools/auth";
import { useNavigate } from "react-router-dom";

export default function Login() {
	const navigator = useNavigate();
	const handleLogin = () => {
		const preToken: object = {
			token: "hjsdbvfjhysebfjkd762354",
			expired: Date.now(),
		};
		console.log(JSON.stringify(preToken));

		setToken(JSON.stringify(preToken)); //模拟设置token
		navigator(`/`);
	};

	const handleRush = () => {
		navigator(`/`); //模拟强行进入主页
	};
	return (
		<div
			style={{
				marginTop: "30px",
				display: "flex",
				alignItems: "center",
				justifyContent: "center",
			}}
		>
			<Button
				type={"primary"}
				onClick={() => {
					handleLogin();
				}}
				style={{ marginRight: "15px" }}
			>
				登录进入系统主页
			</Button>
			<Button
				type={"primary"}
				onClick={() => {
					handleRush();
				}}
			>
				强行进入系统主页
			</Button>
		</div>
	);
}
```

## 5. 总结

> **本实践没有过多的文本描述，多在代码中的注释。但通过此个实践了解学习之后，应该可以较好的掌握在的 React Hooks 项目中应用 Router V6 封装整个项目的路由系统，能够真正实现一次封装，多处收益**

相关的配套实践 Demo 会上传 Github 开源

项目链接：[React Router V6 项目中的路由鉴权封装实践（Hooks）](https://github.com/hfLiu15709732/react_router_pkg_practice)
