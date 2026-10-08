# 时间管理

[在线体验](https://wk1499456234-glitch.github.io/time-management-showcase/) · [GitHub](https://github.com/wk1499456234-glitch/time-management-showcase) · [日本語](README.md)

把“用了多少时间”和“做了什么”放在一起，帮助自己回顾活动。

## 功能入口

- [计时与 Output](https://wk1499456234-glitch.github.io/time-management-showcase/#timer)：选择活动，记录时间和做了什么。
- [今日记录](https://wk1499456234-glitch.github.io/time-management-showcase/#records)：查看今天结束的活动和 Output。
- [保存与备份](https://wk1499456234-glitch.github.io/time-management-showcase/#backup)：查看保存状态及 JSON 导出、导入操作，说明会展开。

也可以用页面内的同名导航，在同一个标签页中移动。定位本身不会改变计时或记录，也不会自动执行备份操作。

## 为什么做、适合谁

这个工具面向希望回顾学习或个人项目的人。只记“学习了30分钟”，还看不出具体进展。如果同时写下“确认了类型差异，写了一个例子”，之后就容易想起当时做了什么。

这段由用户填写的“做了什么”的文字就是 **Output**，不是 AI 自动评价成果的功能。

## 先用一次

1. 选择活动，点击“开始”。
2. 在运行时输入 Output，**点击“追加”**。
3. 需要休息时点击“暂停”，回来后点击“恢复”。
4. 点击“结束”，查看汇总和“今日记录”。

“本地数据与备份”显示“已保存到当前浏览器”的记录可以在刷新页面后恢复。如有警告，请先处理或导出 JSON；在确认保存成功前，先不要刷新。**暂停时不能新增 Output。** 请先完成追加，或恢复计时后再输入。结束后可以在今日记录中编辑已有的 Output。

## 现在能做什么、数据存哪里

| 状态 | 内容 |
| --- | --- |
| 已实现 | 从固定的4种活动中选择1个计时。开始、暂停、恢复、结束，Output，今日记录与汇总。日文、中文切换。 |
| 已实现 | 当前浏览器保存与恢复；用 JSON 文件导出和导入备份。 |
| 未实现 | 账号、服务器记录保存、跨设备同步、AI分析。 |
| 开发中 | 历史、分析、设置页面。暂不能修改活动、参考时间或手动修正时间。 |

记录**只保存在各位访客自己的浏览器中**，不会发送给作者或其他访客，也不会自动转移到另一台设备。**清除网站数据会丢失记录。** 请定期在“本地数据与备份”中选择“导出 JSON 备份”，将这份可用于恢复的记录文件另存到安全位置。

## 限制与详细资料

运行中关闭页面仍会累计时间；暂停后不累计有效时间。短于一分钟的记录，在分单位汇总里可能显示0分钟。画面上的8小时是固定展示参考值，不是个性化目标或客观效率分数。计时依赖设备时钟。

如果出现无法保存的警告，请在关闭或刷新前导出备份。结束隐私浏览也可能丢失记录。真实 iPhone/Safari，以及同时手动操作两个产品页面的试验尚未进行。后续候选包括历史浏览和保存方式的扩展。

- [开发记录（摘录，日文）](docs/DEVELOPMENT-PROGRESS.md)：开发目标、决定理由、各阶段进度与尚未完成的规划。
- [技术补充、完整验证记录与未确认范围](docs/VALIDATION.md)：包括同时编辑与重复导入备份的处理。
- [代码来源](PROVENANCE.md) · [发布步骤](DEPLOYMENT.md) · [公开文件清单](PUBLIC-FILES.txt)

<details>
<summary>查看截图（内容为虚构测试记录）</summary>

![桌面实测画面](docs/screenshots/desktop.png)

<img src="docs/screenshots/mobile.png" alt="390px宽的浏览器实测画面，不是真实手机照片" width="390" />

</details>

<details>
<summary>开发者本地运行方法</summary>

准备 Node.js 22 以上及 npm，在本目录执行：

```sh
npm ci
npm run dev -- --host 127.0.0.1
```

`npm ci` 按锁文件安装依赖；`dev` 启动开发服务器，打开终端显示的网址即可。

```sh
npm run typecheck
npm test
npm run build
npm run check:public
npm run preview -- --host 127.0.0.1 --port 5196 --strictPort
```

依次用于类型检查、计时/保存回归测试、生成 `dist/`、检查公开文件和构建内容、预览生产构建。不要直接双击 HTML，应通过 HTTP 服务器访问。开发和预览端口不同，浏览器记录也相互独立。

</details>
