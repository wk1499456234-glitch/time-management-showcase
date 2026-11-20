# TimeWeave

记录投入的时间和实际完成的内容，帮助回顾自己的行动。它源于一个日常问题：只知道花了多久，还不容易看清做成了什么。

**[打开 TimeWeave](https://wk1499456234-glitch.github.io/time-management-showcase/)** · [日本語](README.md)

![TimeWeave AI回顾页面：并列显示虚构学习记录的时间、成果及已保存的解释](docs/screenshots/timeweave-review-desktop.jpg)

图中是四个页面之一的AI回顾页，使用此前版本的浏览器截图，当前画面可通过TimeWeave公开网址查看。截图版本与验证范围见[图片来源说明](PROVENANCE.md)。

## 主要功能与使用流程

1. 在[计时](https://wk1499456234-glitch.github.io/time-management-showcase/#/timer)页选择活动并开始，按需暂停、恢复、结束。有效时间不包含暂停区间。
2. 计时中输入学到了什么、完成了多少，点击“保存成果”。这份原文称为 **Output**，可以包含数量，也可以只记录理解和思考。
3. 在[记录](https://wk1499456234-glitch.github.io/time-management-showcase/#/records)页查看“我的试用记录”，展开已结束活动并编辑原文。切换到“虚构学习示例”可查看整理成果、数量、单位、原始AI解析及人工确认内容。固定示例只读。
4. 在[AI 回顾](https://wk1499456234-glitch.github.io/time-management-showcase/#/review)页选择示例周，查看时间分布、成果比较和已保存的解释、建议，展开依据。没有保存AI结果的周只显示统计。
5. 在[设置](https://wk1499456234-glitch.github.io/time-management-showcase/#/settings)页切换中日文、导出或读取试用记录的JSON备份。

## 关于使用环境

当前公开网址采用以下运行方式：

- 计时与成果记录保存在浏览器中。
- AI回顾可阅读由虚构学习记录生成并保存的结果，与自己的试用记录分开。
- 新记录的AI整理和回顾生成，需要连接负责保存记录与AI处理的服务器，并在已获授权、完成AI配置的环境中使用。

当前网址不发送新输入给AI，不把固定结果当作这些输入的分析。浏览、刷新、切换语言不会触发生成，已保存的AI正文保持日文。

## 记录保全与回顾的阅读方式

记录不自动跨设备同步，清除网站数据会丢失记录。清除数据或更换设备前请导出JSON。导入会先预览数量，再合并相同记录；重复记录不追加，内容冲突会被拒绝。

保存失败时不要关闭页面，请使用“重试同一保存”或导出JSON。即使画面仍显示内容，在保存成功前关闭页面也可能丢失。

AI建议用于辅助思考。复习数量不等于掌握程度，作答数量不等于正确率；缺少目标、难度、成绩等信息时应保留判断。时间属于整次活动，不推算单条成果的专属耗时。

## 技术与相关资料

TimeWeave的界面使用React、TypeScript实现，通过Vite构建。当前公开网址由GitHub Pages提供。日期、时刻与每日统计统一采用Asia/Tokyo，每周从周一开始。

以下资料以日文维护，避免重复维护不同版本的定义：

| 资料 | 内容 |
| --- | --- |
| [需求定义](docs/REQUIREMENTS.md) | 使用场景、功能范围、验收条件 |
| [记录与统计定义](docs/RECORD-DEFINITION.md) | 原文、成果、时间、数量和比较规则 |
| [设计说明](docs/DESIGN.md) | 页面、保存恢复及数据分离 |
| [AI辅助开发的实践心得](docs/DEVELOPMENT-PROGRESS.md) | 用Markdown接续工作，以及结合AI验证与实际操作的经验 |
| [开发流程与跨聊天接续](docs/DEVELOPMENT-WORKFLOW.md) | 操作流程、职责与工作恢复 |
| [验证记录](docs/VALIDATION.md) | 各版本的实际结果和未验证项 |
| [构建、发布与恢复](DEPLOYMENT.md) | 发布步骤及正式资源核对 |
| [来源说明](PROVENANCE.md) | 代码、图片、固定数据及AI结果来源 |
