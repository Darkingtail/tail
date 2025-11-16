type TechItem = {
	tech: string;
	version: string;
	description: string;
};

type ToolItem = {
	tool: string;
	version: string;
};

const techStack: TechItem[] = [
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

const devTools: ToolItem[] = [
	{ tool: "JDK", version: "17" },
	{ tool: "MySQL", version: "5.7+" },
	{ tool: "Redis", version: "3.2+" },
];

export default function Home() {
	return (
		<div className="space-y-4 text-sm leading-relaxed text-[#333]">
			<section className="rounded-md border border-solid border-[#f1f1f1] bg-white p-6 shadow-sm">
				<p>
					一个基于 Spring Boot、Spring OAuth2.0、MyBatis、Redis 打造的轻量级、前后端分离、支持完整 SKU 与下单流程的开源商城。
				</p>
				<p>该项目仅供学习参考，如需商用请联系作者授权，违规使用将依法追责。</p>
				<h2 className="mt-6 text-lg font-semibold">前言</h2>
				<p>
					<code>mall4j</code> 致力于为中小企业提供一个完整、易维护的开源电商系统，后台包含商品管理、订单管理、运费模板、规格管理、会员管理、运营管理、内容管理、统计报表、权限管理、设置等模块。
				</p>
				<h2 className="mt-6 text-lg font-semibold">技术选型</h2>
				<div className="overflow-x-auto">
					<table className="w-full border-collapse text-left text-xs">
						<thead>
							<tr className="bg-[#fafafa]">
								<th className="border border-[#e5e5e5] px-3 py-2">技术</th>
								<th className="border border-[#e5e5e5] px-3 py-2">版本</th>
								<th className="border border-[#e5e5e5] px-3 py-2">说明</th>
							</tr>
						</thead>
						<tbody>
							{techStack.map((item) => (
								<tr key={item.tech}>
									<td className="border border-[#e5e5e5] px-3 py-2">{item.tech}</td>
									<td className="border border-[#e5e5e5] px-3 py-2">{item.version}</td>
									<td className="border border-[#e5e5e5] px-3 py-2">{item.description}</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
				<h2 className="mt-6 text-lg font-semibold">部署教程</h2>
				<h3 className="mt-4 text-base font-semibold">1. 开发环境</h3>
				<div className="overflow-x-auto">
					<table className="w-full border-collapse text-left text-xs">
						<thead>
							<tr className="bg-[#fafafa]">
								<th className="border border-[#e5e5e5] px-3 py-2">工具</th>
								<th className="border border-[#e5e5e5] px-3 py-2">版本</th>
							</tr>
						</thead>
						<tbody>
							{devTools.map((item) => (
								<tr key={item.tool}>
									<td className="border border-[#e5e5e5] px-3 py-2">{item.tool}</td>
									<td className="border border-[#e5e5e5] px-3 py-2">{item.version}</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
				<h3 className="mt-4 text-base font-semibold">2. 启动步骤</h3>
				<ul className="list-disc space-y-1 pl-5 text-sm">
					<li>推荐使用 IntelliJ IDEA，安装 Lombok 插件后导入 Maven 项目。</li>
					<li>
						导入 <code>shop.sql</code> 到 MySQL，并在 <code>application-dev.yml</code> 中配置 datasource URL、用户名、密码。
					</li>
					<li>启动 Redis 服务。</li>
					<li>
						通过 <code>WebApplication</code> 启动后台接口，<code>ApiApplication</code> 启动前端接口。
					</li>
				</ul>
			</section>
		</div>
	);
}
