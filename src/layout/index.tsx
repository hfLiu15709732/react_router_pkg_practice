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
						defaultActiveKey="1"
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
