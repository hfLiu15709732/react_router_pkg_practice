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
		navigator(`/`); //强行进入主页
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
