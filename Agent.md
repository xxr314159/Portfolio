# Agent.md · 数字书房开发规范

## 项目概述
安静风格的数字书房个人网站，纯 HTML/CSS/JS，支持 Markdown 博客渲染，部署到 GitHub Pages。详细需求见 `PRD.md`，技术决策见 `技术设计文档.md`。

## 开发原则

### 1. 先读文档再动手
必须完整阅读 `PRD.md` 和 `技术设计文档.md`，理解"安静"二字的核心气质——低对比、慢动效、克制圆角、不用荧光色。任何偏离此气质的改动都必须先记录理由。

### 2. 最小改动 · 精准 Edit
每次只改一个模块，改完立刻验证。不要一次性重写整个文件。不确定效果时先做小范围试验。

### 3. Git 提交规范
每完成一个功能点就提交一次。格式：`type: 简短描述`（type = feat/fix/style/docs/refactor）。
示例：`feat: 技能藏书卡翻书展开`

### 4. 禁止事项
- ❌ 引入任何 npm 包或 CDN 外部依赖
- ❌ 生成后不验证就说"完成了"
- ❌ 擅自添加 PRD 里没有的功能
- ❌ 用中文写代码注释或 commit message
- ❌ 使用荧光/高饱和颜色（强调色仅限 `#8ab4f8`）
- ❌ 让动效超过 400ms（除了翻书展开 600ms）

### 5. 安静模式约束
所有 transition / animation 必须支持 `.quiet-mode` 类关闭。CSS 写法：
```css
.elem { transition: opacity 300ms; }
.quiet-mode .elem { transition: none; }
```

## 修改流程

1. **定位**：先读现有文件，理解要改什么
2. **规划**：列出改动点，控制在 3 处以内
3. **执行**：精准 Edit，不用全量重写
4. **验证**：本地打开 HTML 确认效果
5. **提交**：git add → commit → push

## 测试清单（每次改完必查）

- [ ] 桌面端（1025px+）侧边锚点高亮正确
- [ ] 平板端（601-1024px）瀑布流两列
- [ ] 手机端（≤ 600px）底部导航、无横向滚动
- [ ] 安静模式开启后所有动效归零
- [ ] 键盘 Tab 可聚焦所有交互元素
- [ ] 博客 Markdown 渲染正常、代码高亮正常
- [ ] 控制台无报错
- [ ] 图片有 alt 属性

## 个人信息（不要改这些）

```
昵称：袭锌睿
GitHub：https://github.com/xxr314159
邮箱：846300839@qq.com
GitHub 头像：https://avatars.githubusercontent.com/u/xxr314159?v=4
```
