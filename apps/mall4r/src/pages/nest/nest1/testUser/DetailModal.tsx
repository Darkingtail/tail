import { Checkbox, Form, Input, Modal } from "antd";
import { forwardRef, useEffect, useImperativeHandle, useMemo } from "react";

export type DetailModalType = "view" | "update" | "add";

export interface TestUserFormFields {
	id?: number;
	userName: string;
	password: string;
	hobby: string[];
}

export interface TestUserFormFieldsString
	extends Omit<TestUserFormFields, "hobby"> {
	hobby: string;
}

interface DetailModalProps {
	initialValues: TestUserFormFieldsString | null;
	open: boolean;
	confirmLoading: boolean;
	type: DetailModalType;
	hobbyList: { label: string; value: string }[];
	onOk: (values: TestUserFormFields) => void;
	onCancel: () => void;
}

export type DetailModalHandle = {
	resetForm: () => void;
	setFieldsValue: (values: Partial<TestUserFormFields>) => void;
};

export const DetailModal = forwardRef<DetailModalHandle, DetailModalProps>(
	(
		{
			open,
			confirmLoading,
			type,
			hobbyList,
			initialValues,
			onOk,
			onCancel,
		}: DetailModalProps,
		ref,
	) => {
		const title = useMemo(
			() =>
				type === "add"
					? "Add User"
					: type === "update"
						? "Update User"
						: "View User",
			[type],
		);
		const [form] = Form.useForm<TestUserFormFields>();
		useImperativeHandle(ref, () => ({
			resetForm: () => form.resetFields(),
			setFieldsValue: (values: Partial<TestUserFormFields>) =>
				form.setFieldsValue(values),
		}));

		useEffect(() => {
			if (initialValues) {
				form.setFieldsValue({
					...initialValues,
					hobby: Array.isArray(initialValues.hobby)
						? initialValues.hobby
						: (initialValues.hobby?.split(",") ?? []),
				});
			} else {
				form.resetFields();
			}
		}, [form, initialValues]);

		return (
			<Modal
				title={title}
				open={open}
				confirmLoading={confirmLoading}
				onOk={() => {
					form
						.validateFields()
						.then((values) => {
							onOk(values);
						})
						.catch((info) => {
							console.log("Validate Failed:", info);
						});
				}}
				onCancel={() => onCancel()}
			>
				<Form
					form={form}
					name="test-user-detail-modal"
					labelCol={{ span: 4 }}
					wrapperCol={{ span: 20 }}
					style={{ maxWidth: 600 }}
					autoComplete="off"
				>
					<Form.Item<TestUserFormFields> name="id" hidden>
						<Input />
					</Form.Item>

					<Form.Item<TestUserFormFields>
						label="Username"
						name="userName"
						rules={[{ required: true, message: "Please input your username!" }]}
					>
						<Input />
					</Form.Item>

					<Form.Item<TestUserFormFields>
						label="Password"
						name="password"
						rules={[{ required: true, message: "Please input your password!" }]}
					>
						<Input />
					</Form.Item>

					<Form.Item<TestUserFormFields>
						label="Hobby"
						name="hobby"
						rules={[{ required: true, message: "Please select your hobby!" }]}
					>
						{hobbyList.length > 0 ? (
							<Checkbox.Group options={hobbyList} disabled={type === "view"} />
						) : (
							<div>No hobbies available</div>
						)}
					</Form.Item>
				</Form>
			</Modal>
		);
	},
);
