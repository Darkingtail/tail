import {
	type TestUser,
	createTestUserApi,
} from "@/service/api/nest/nest1/test-user";
import type { TableProps } from "antd";
import { Button, Form, Input, Space, Table, Tag } from "antd";
import { useCallback, useEffect, useMemo, useState } from "react";

type ColumnsType<T extends object> = TableProps<T>["columns"];
type FilterValues = Partial<Pick<TestUser, "userName" | "password" | "hobby">>;

const columns: ColumnsType<TestUser> = [
	{
		title: "UserName",
		dataIndex: "userName",
		key: "userName",
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
				{hobbies.split(",").map((hobby) => (
					<Tag key={hobby}>{hobby}</Tag>
				))}
			</span>
		),
	},
	{
		title: "Action",
		key: "action",
		width: 100,
		render: () => (
			<Space size="middle">
				<Button type="link">Update</Button>
				<Button type="link">Delete</Button>
			</Space>
		),
	},
];

const testUserApi = createTestUserApi();

const TestUserPage: React.FC = () => {
	const [dataSource, setDataSource] = useState<TestUser[]>([]);
	const [current, setCurrent] = useState(1);
	const [pageSize, setPageSize] = useState(10);
	const [total, setTotal] = useState(0);
	const [loading, setLoading] = useState(false);
	const [filters, setFilters] = useState<FilterValues>({});
	const [form] = Form.useForm<FilterValues>();

	const params = useMemo(
		() => ({
			current,
			size: pageSize,
			createTime: "",
			updateTime: "",
			...filters,
		}),
		[current, pageSize, filters],
	);

	const fetchDataSource = useCallback(async () => {
		setLoading(true);
		try {
			const res = await testUserApi.page(params);
			setDataSource(
				res.records.map((record) => ({
					...record,
					key: record.id ?? record.createTime,
				})),
			);
			setTotal(res.total);
		} finally {
			setLoading(false);
		}
	}, [params]);

	useEffect(() => {
		fetchDataSource();
	}, [fetchDataSource]);

	const handlePaginationChange = (pageNumber: number, size?: number) => {
		setCurrent(pageNumber);
		if (size && size !== pageSize) {
			setPageSize(size);
		}
	};

	const handlePageSizeChange = (pageNumber: number, size: number) => {
		setCurrent(pageNumber);
		setPageSize(size);
	};

	const handleSearch = (values: FilterValues) => {
		setFilters(values);
		setCurrent(1);
	};

	const handleReset = () => {
		form.resetFields();
		setFilters({});
		setCurrent(1);
	};

	return (
		<>
			<Form form={form} layout="inline" clearOnDestroy onFinish={handleSearch}>
				<Form.Item label="username" name="userName">
					<Input placeholder="input userName" />
				</Form.Item>
				<Form.Item label="password" name="password">
					<Input placeholder="input password" />
				</Form.Item>
				<Form.Item label="hobby" name="hobby">
					<Input placeholder="input hobby" />
				</Form.Item>
				<Form.Item>
					<Button type="primary" htmlType="submit">
						Submit
					</Button>
				</Form.Item>
				<Form.Item>
					<Button onClick={handleReset}>Clear</Button>
				</Form.Item>
			</Form>
			<Table<TestUser>
				className="mt-2"
				size="small"
				loading={loading}
				columns={columns}
				rowKey={(record) =>
					record.id ?? `${record.userName}-${record.createTime}`
				}
				pagination={{
					position: ["bottomLeft"],
					showQuickJumper: true,
					showSizeChanger: true,
					current,
					pageSize,
					total,
					onChange: handlePaginationChange,
					onShowSizeChange: handlePageSizeChange,
				}}
				dataSource={dataSource}
			/>
		</>
	);
};

export default TestUserPage;
