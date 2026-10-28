# FilmPlan v0.1：先设计连续视觉叙事

FilmPlan 的可运行定义在 `studio/src/film-plan.ts`，示例在 `studio/src/sample-plan.ts`。字段由 Zod 定义并推导 TypeScript 类型；预览加载时会验证结构，`npm run test:plan` 检查跨字段约束。现阶段只有一个世界和一段 15 秒的无声动态分镜，不能视为完整讲解片。

上游先用 [`concept-proposal.md`](../templates/concept-proposal.md) 比较并选定脚本与镜头方向，再写完整解说词和 FilmPlan。创意提案不分配精确帧；进入 FilmPlan 后，镜头、对象和声音都以它为唯一时间依据。

## 计划的六层

| 层 | 必须回答的问题 | v0.1 字段 |
| --- | --- | --- |
| Brief | 谁看、看完理解什么 | `brief` |
| Beat | 观众认知如何变化 | `beats[].before/change/after` |
| World | 哪些对象在同一空间里持续存在 | `worlds[].objects[]`、稳定 `id`、全片对象关键帧 |
| Shot | 镜头为何移动、焦点在哪里 | `shots[].purpose/focusObjectId/camera` |
| Marker | 哪一帧承接语词或动作 | `markers[]`、`audio.status` |
| Critic | 哪里可能不连续或不可读 | 计划校验、关键帧检查、人工审样片 |

所有时间都使用从零开始的绝对帧。Beat 和 Shot 采用 `[startFrame, endFrame)`，必须无空隙、无重叠地覆盖全片。对象关键帧覆盖 `0…durationFrames`，因此跳到任意一帧都能重算状态。`continuous` 和同世界的 `anchor-bridge` 要求相机边界一致；跨 world 不允许无说明的 `continuous`。`voice-locked` 必须有配音文件；修改配音后要重定标记和镜头，而不是只移动字幕。

`transitionOut` 是带类型的选择：`continuous` 保持同一空间与相机连续；`cut` 明确硬切；`anchor-bridge` 在同一 world 中让两个对象通过可见路径接力；`object-match` 指明前一 world 的对象与下一 world 的对象如何形成视觉匹配。后两者必须引用真实对象。`object-match` 只记录导演意图，画面匹配和跨世界镜头仍需在该期的动态分镜里实现、观看和审定。

`studio/src/CameraRig.tsx` 使用统一二维世界坐标，投影为 `screen = (world - target) × scale + viewportCenter`。`studio/src/AnchorBridge.tsx` 从计划中的起止对象、绘制时长和清除帧生成接力线。前景、主体、背景仍是同一世界中的图层；字幕、进度等固定界面保持在镜头外。二维素材不声称实现真实环绕或景深。`objectPoseAt(frame)` 由对象关键帧纯计算状态，同一对象不会因换镜被销毁再创建。

## 当前导演样片

主题是“把思路接回来”，4 个 beat 共 450 帧／30 fps：0–3 秒认出思路节点；3–6 秒消息改变焦点；6–10 秒节点沿线进入保存位；10–15 秒节点回原位，镜头拉远并停顿。一次急推只放在打断处，保存段让同一节点贯穿，结尾留出静止时间。配音和音效还未接入，`audio.status` 保持 `placeholder`。

借鉴的镜头语法来自原版 [video-shotcraft](https://github.com/Vincentwei1021/video-shotcraft)：[spotlight-hero-card](https://github.com/Vincentwei1021/video-shotcraft/blob/main/references/shots/opening/spotlight-hero-card.md) 的单主角聚焦，[crash-zoom-punch](https://github.com/Vincentwei1021/video-shotcraft/blob/main/references/shots/camera/crash-zoom-punch.md) 的一次短促推近，[line-carry-transition](https://github.com/Vincentwei1021/video-shotcraft/blob/main/references/shots/transition/line-carry-transition.md) 的同线索接力，以及 [row-embed](https://github.com/Vincentwei1021/video-shotcraft/blob/main/references/shots/ui-entrance/row-embed.md) 的保存记录落位。本样片重新实现了适合知识讲解的简化版本，没有复制上游组件、音效或完整镜头模板。

## 质检顺序

1. `npm run test:plan`：计划结构、时间覆盖、ID 引用、相机边界、音频状态。
2. `npm run lint`：Remotion 源码和 TypeScript。
3. Studio 逐帧看 beat 起止、快速运动的前后几帧，以及字幕安全区；发现遮挡后修改同一计划或渲染组件。
4. 产生样片后检查画面和声音。黑帧、速度突变只能作为候选问题，导演需判断是否有意设计。无配音样片不做声画同步结论。
5. 人工审 10–15 秒代表片段后，再投入精细图解、配音和整片制作。

此版本验证的是共享状态与镜头连续性；跨世界对象匹配已有计划校验，尚无通用渲染组件。[参考录屏分析](reference-analysis.md)为原位图解演变、真正的停顿和跨世界视觉母题提供了测试案例，并不规定以后每期的视觉风格。后续只有在真实作品需要时，才增加跨世界渲染、空间深度、自动溢出检测和品牌镜头库。
