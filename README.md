# Video Making System Cache

一套可重复执行、可审阅、可改进的知识讲解视频制作流程。本仓库保存流程与模板，不包含示范视频，也不复制工具代码或素材。

## 工具分工

| 工具 | 职责 | 主要交付 |
| --- | --- | --- |
| Anything to Explainer Production | 统筹调研、解说词、分镜、配音、字幕时间轴和质量检查 | research.md、narration.txt、storyboard.md、时间轴与 QC 记录 |
| Anatomy | 将复杂机制设计成有真实部件和动作逻辑的图解；机制不需要拆解时跳过 | 可重建的图解源码、SVG 或逐帧图像、图解说明 |
| Remotion | 编排镜头、图解、配音、字幕与覆盖层，提供预览和渲染 | Studio 预览、成片与渲染配置 |

## 每期制作

1. 复制 templates/episode-brief.md，确定受众、主题、时长、语言、格式和来源。
2. 按 docs/workflow.md 完成调研、文案审阅、分镜、图解、配音、合成与质检。
3. 使用 templates/episode-review.md 记录版本、质量问题与复盘。
4. 按 CONTRIBUTING.md 提交基于实际制作证据的流程改进。

## 仓库边界

提交流程、模板、自有源码、来源清单和经确认的质检记录。大体积成片、音频、渲染帧和缓存留在本地或外部存储。不要提交密钥、登录信息、未获授权素材或第三方工具的整份拷贝。

详见 docs/workflow.md 和 docs/tools.md。
