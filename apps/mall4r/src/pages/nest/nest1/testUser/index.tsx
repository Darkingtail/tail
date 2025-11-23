import {
	type TestUser,
	createTestUserApi,
} from "@/service/api/nest/nest1/test-user";
import type { TableProps } from "antd";
import {
	Button,
	Form,
	Input,
	Popconfirm,
	Space,
	Table,
	Tag,
	message,
} from "antd";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
	DetailModal,
	type DetailModalHandle,
	type DetailModalType,
	type TestUserFormFields,
	type TestUserFormFieldsString,
} from "./DetailModal";
import useHobbyList from "./useHobbyList";

type ColumnsType<T extends object> = TableProps<T>["columns"];
type FilterValues = Partial<Pick<TestUser, "userName" | "password" | "hobby">>;

const testUserApi = createTestUserApi();

const TestUserPage: React.FC = () => {
	const [dataSource, setDataSource] = useState<TestUser[]>([]);
	const [current, setCurrent] = useState(1);
	const [pageSize, setPageSize] = useState(10);
	const [total, setTotal] = useState(0);
	const [loading, setLoading] = useState(false);
	const [filters, setFilters] = useState<FilterValues>({});
	const [form] = Form.useForm<FilterValues>();
	const [detailModalOpen, setDetailModalOpen] = useState(false);
	const [detailModalType, setDetailModalType] =
		useState<DetailModalType>("add");
	const [confirmLoading, setConfirmLoading] = useState(false);
	const modalRef = useRef<DetailModalHandle>(null);
	const [editingRecord, setEditingRecord] = useState<TestUser | null>(null);

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
			render: (hobbies: string) => {
				const label = hobbies
					.split(",")
					.map((i) => hobbyList.find((h) => h.value === i)?.label ?? i)
					.join(", ");
				return (
					<span>
						{label.split(",").map((hobby) => (
							<Tag key={hobby}>{hobby}</Tag>
						))}
					</span>
				);
			},
		},
		{
			title: "Action",
			key: "action",
			width: 100,
			render: (_, record) => (
				<Space size="middle">
					<Button type="link" onClick={() => handleUpdate(record)}>
						Update
					</Button>

					<Popconfirm
						title="Sure to delete?"
						onConfirm={() => handleDelete(record)}
					>
						<Button type="link">Delete</Button>
					</Popconfirm>
				</Space>
			),
		},
	];
	const { hobbyList, done } = useHobbyList();

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
		if (done) {
			fetchDataSource();
		}
	}, [fetchDataSource, done]);

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

	const handleAdd = () => {
		setEditingRecord(null);
		setDetailModalType("add");
		setDetailModalOpen(true);
	};

	const handleUpdate = (record: TestUser) => {
		setDetailModalType("update");
		setEditingRecord(record);
		const { id } = record;
		if (id) {
			// Fetch user details and populate the form
			console.log("Fetching details for user ID:", id);
			testUserApi
				.info(id)
				.then((data) => {
					const valuesWithHobbyArray = {
						...data,
						hobby: data.hobby ? data.hobby.split(",") : [],
					};
					modalRef.current?.setFieldsValue(valuesWithHobbyArray);
					setDetailModalOpen(true);
				})
				.catch((error) => {
					console.log("Error fetching user details:", error);
				});
		}
	};

	const handleDelete = (record: TestUser) => {
		const { id } = record;
		if (id) {
			// Implement delete logic here
			console.log("Deleting user ID:", id);
			testUserApi
				.delete(id)
				.then(() => {
					// After deletion, refetch the data source
					fetchDataSource();
					message.success("User deleted successfully");
				})
				.catch((error) => {
					console.log("Error deleting user:", error);
				});
		}
	};

	const handleDetailModalOk = (values: TestUserFormFields) => {
		setConfirmLoading(true);
		const valuesWithHobbyString = {
			...values,
			hobby: values.hobby.join(","),
		};
		switch (detailModalType) {
			case "view":
				// do nothing
				return;
			case "update":
				void testUserApi
					.update(valuesWithHobbyString)
					.then(() => {
						handleDetailModalClose();
						fetchDataSource();
						message.success("User updated successfully");
					})
					.catch((error) => {
						console.log("error:", error);
					})
					.finally(() => {
						setConfirmLoading(false);
					});
				return;
			case "add":
				void testUserApi
					.add(valuesWithHobbyString)
					.then(() => {
						handleDetailModalClose();
						fetchDataSource();
						message.success("User added successfully");
					})
					.catch((error) => {
						console.log("error:", error);
					})
					.finally(() => {
						setConfirmLoading(false);
					});
				return;
			default:
				return;
		}
	};

	const handleDetailModalClose = () => {
		modalRef.current?.resetForm();
		setDetailModalOpen(false);
		setEditingRecord(null);
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
			<Button onClick={() => handleAdd()}>Add</Button>
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
			<DetailModal
				ref={modalRef}
				type={detailModalType}
				open={detailModalOpen}
				confirmLoading={confirmLoading}
				hobbyList={hobbyList}
				initialValues={
					editingRecord
						? ({
								...editingRecord,
								hobby: editingRecord.hobby ?? "",
							} as TestUserFormFieldsString)
						: null
				}
				onOk={(values: TestUserFormFields) => handleDetailModalOk(values)}
				onCancel={() => handleDetailModalClose()}
			/>
		</>
	);
};

export default TestUserPage;
