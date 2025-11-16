import {
	type TestUser,
	createTestUserApi,
} from "@/service/api/nest/nest1/test-user";
import type { PaginationProps, TableProps } from "antd";
import { Button, Space, Table, Tag } from "antd";
import { useCallback, useEffect, useState } from "react";

type ColumnsType<T extends object> = TableProps<T>["columns"];

const columns: ColumnsType<TestUser> = [
	{
		title: "UserName",
		dataIndex: "userName",
		key: "userName",
		render: (text) => text,
	},
	{
		title: "Password",
		dataIndex: "password",
		key: "password",
	},
	{
		title: "Hobby",
		dataIndex: "hobby",
		key: "hobby",
		render: (hobbies: string) => (
			<span>
				{hobbies.split(",").map((hobby) => {
					return <Tag key={hobby}>{hobby}</Tag>;
				})}
			</span>
		),
	},
	{
		title: "Action",
		key: "action",
		width: 100,
		render: (_, record) => (
			<Space size="middle">
				<Button type="link">Update</Button>
				<Button type="link">Delete</Button>
			</Space>
		),
	},
];

const testUserApi = createTestUserApi();

const App: React.FC = () => {
	const [dataSource, setDataSource] = useState<TestUser[]>([]);
	const [defaultCurrent, setDefaultCurrent] = useState(1);
	const [total, setTotal] = useState(0);
	const [size, setSize] = useState(10);
	const fetchDataSource = useCallback(() => {
		testUserApi
			.page({
				userName: "",
				password: "",
				hobby: "",
				createTime: "",
				updateTime: "",
				current: defaultCurrent,
				size: size,
			})
			.then((res) => {
				setDataSource(
					res.records.map((i) => ({
						...i,
						key: i.id ?? i.createTime,
					})),
				);
				setTotal(res.total);
			})
			.catch(() => {});
	}, [defaultCurrent, size]);

	useEffect(() => {
		fetchDataSource();
	}, [fetchDataSource]);

	const onChange: PaginationProps["onChange"] = (pageNumber) => {
		setDefaultCurrent(pageNumber);
	};
	const onShowSizeChange: PaginationProps["onShowSizeChange"] = (
		current,
		size,
	) => {
		setSize(size);
	};
	return (
		<>
			<Table<TestUser>
				size="small"
				columns={columns}
				pagination={{
					position: ["bottomLeft"],
					showQuickJumper: true,
					showSizeChanger: true,
					defaultCurrent,
					total,
					onChange: onChange,
					onShowSizeChange: onShowSizeChange,
				}}
				dataSource={dataSource}
			/>
		</>
	);
};

export default App;
