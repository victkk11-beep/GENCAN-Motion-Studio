# GENCAN 动态分镜

这是一段 15 秒竖版、无配音的导演样片，用来验证同一世界中的运镜、对象连续性和停顿。`src/sample-plan.ts` 是时间与状态唯一数据源，`src/film-plan.ts` 定义结构与跨字段校验，`src/Animatic.tsx` 负责可重建的画面。画面中的叙述是视觉比喻，不声称已验证脑科学论断。

## Commands

安装依赖：

```console
npm install
```

预览 `GENCAN-ContextThread`：

```console
npm run dev
```

检查计划与类型：

```console
npm run test:plan
npm run lint
```

按需导出审阅片：

```console
npx remotion render src/index.ts GENCAN-ContextThread out/animatic.mp4
```

导演计划、镜头卡借鉴关系及质检边界见 [`../docs/film-plan.md`](../docs/film-plan.md)。正式制作仍需定稿文案、配音、音效和事实来源。Remotion 的使用许可依其[官方条款](https://github.com/remotion-dev/remotion/blob/main/LICENSE.md)。
