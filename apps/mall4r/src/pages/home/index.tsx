import { Card, List, Table, Typography, theme } from "antd";

const techStack = [
	{ tech: "Spring Boot", version: "3.0.4", description: "MVC 核心框架" },
	{ tech: "MyBatis", version: "3.5.0", description: "ORM 框架" },
	{ tech: "MyBatisPlus", version: "3.5.3.1", description: "基于 MyBatis 的增强工具" },
	{ tech: "Swagger-UI", version: "4.0.0", description: "API 文档生成工具" },
	{ tech: "Redisson", version: "3.19.3", description: "Redis 客户端，支持分布式锁" },
	{ tech: "Hikari", version: "3.2.0", description: "数据库连接池" },
	{ tech: "Log4j2", version: "2.17.2", description: "日志框架" },
	{ tech: "Lombok", version: "1.18.8", description: "简化 Java Bean 封装" },
	{ tech: "Hutool", version: "5.8.15", description: "常用 Java 工具集" },
	{ tech: "XXL-JOB", version: "2.3.1", description: "分布式定时任务平台" },
];

const devTools = [
	{ tool: "JDK", version: "17" },
	{ tool: "MySQL", version: "5.7+" },
	{ tool: "Redis", version: "3.2+" },
];

const techColumns = [
	{ title: "技术", dataIndex: "tech", key: "tech", width: 140 },
	{ title: "版本", dataIndex: "version", key: "version", width: 100 },
	{ title: "说明", dataIndex: "description", key: "description" },
];

const toolColumns = [
	{ title: "工具", dataIndex: "tool", key: "tool", width: 120 },
	{ title: "版本", dataIndex: "version", key: "version", width: 100 },
];

export default function Home() {
	const { token } = theme.useToken();

	return (
		<div className="space-y-4">
			<Card
				title="mall4j 简介"
				variant="outlined"
				style={{ background: token.colorBgContainer }}
			>
				<Typography.Paragraph>
					一个基于 Spring Boot、Spring OAuth2.0、MyBatis、Redis 打造的轻量级、前后端分离、支持完整 SKU 与下单流程的开源商城。
				</Typography.Paragraph>
				<Typography.Paragraph>
					该项目仅供学习参考，如需商用请联系作者授权，违规使用将依法追责。
				</Typography.Paragraph>

				<Typography.Title level={4} className="!mt-6">
					前言
				</Typography.Title>
				<Typography.Paragraph>
					<Typography.Text code>mall4j</Typography.Text> 致力于为中小企业提供一个完整、易维护的开源电商系统，后台包含商品管理、订单管理、运费模板、规格管理、会员管理、运营管理、内容管理、统计报表、权限管理、设置等模块。
				</Typography.Paragraph>

				<Typography.Title level={4} className="!mt-6">
					技术选型
				</Typography.Title>
				<Table
					size="small"
					columns={techColumns}
					dataSource={techStack}
					rowKey="tech"
					pagination={false}
				/>

				<Typography.Title level={4} className="!mt-6">
					部署教程
				</Typography.Title>
				<Typography.Title level={5} className="!mt-4">
					1. 开发环境
				</Typography.Title>
				<Table
					size="small"
					columns={toolColumns}
					dataSource={devTools}
					rowKey="tool"
					pagination={false}
				/>
				<Typography.Title level={5} className="!mt-4">
					2. 启动步骤
				</Typography.Title>
				<List
					size="small"
					dataSource={[
						"推荐使用 IntelliJ IDEA，安装 Lombok 插件后导入 Maven 项目。",
						"导入 shop.sql 到 MySQL，并在 application-dev.yml 中配置 datasource URL、用户名、密码。",
						"启动 Redis 服务。",
						"通过 WebApplication 启动后台接口，ApiApplication 启动前端接口。",
					]}
					renderItem={(item) => <List.Item className="!py-1">{item}</List.Item>}
				/>
			</Card>
		</div>
	);
}
