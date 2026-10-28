# OpenMontage 架构借鉴记录

独立安装位置：`C:\Users\Mz\Desktop\OpenMontage`，检视版本 `e01dbf433f46eeb91d39bf905e194162921019a3`。上游采用 [AGPL-3.0](https://github.com/calesthio/OpenMontage/blob/e01dbf433f46eeb91d39bf905e194162921019a3/LICENSE)。此目录独立于 GENCAN；本仓库只记录自己重写的流程与模板，不复制上游程序或 Skill。少量另附 OFL 许可的字体见 [`studio/public/fonts/README.md`](../studio/public/fonts/README.md)。

本机已安装该版本的 Python 核心依赖、Piper 配音包、Remotion 合成器依赖和 FFmpeg 9.0.2；已用上游工具注册表完成能力发现。`.env` 由示例配置创建，云端服务仍需逐项配置。新终端可读取 FFmpeg 更新后的 PATH；尚未用 OpenMontage 渲染成片。

## 提取到 GENCAN 的三项机制

| 上游依据 | 提取的想法 | GENCAN 的落点 |
| --- | --- | --- |
| [`animated-explainer` 流程清单](https://github.com/calesthio/OpenMontage/blob/e01dbf433f46eeb91d39bf905e194162921019a3/pipeline_defs/animated-explainer.yaml) 的 research → proposal → script → scene plan | 在写完整脚本前比较有事实依据的创意方向 | [`concept-proposal.md`](../templates/concept-proposal.md)；[`workflow.md`](workflow.md) 新增提案阶段 |
| [Proposal Director](https://github.com/calesthio/OpenMontage/blob/e01dbf433f46eeb91d39bf905e194162921019a3/skills/pipelines/explainer/proposal-director.md) 的概念选项与选择记录 | 每个候选写出观众问题、开场、认知变化、视觉与声音设想；记录选定理由 | 同一份提案模板中的三种方向和选择记录 |
| [Agent Guide](https://github.com/calesthio/OpenMontage/blob/e01dbf433f46eeb91d39bf905e194162921019a3/AGENT_GUIDE.md) 的阶段产物、检查点与复盘 | 下一阶段只接收上一阶段的明确产物；失败时回到产生问题的阶段 | 简报 → 调研 → 提案 → 解说词 → FilmPlan → 动态分镜 → 成片；现有质检与复盘表 |

提案记录创意选择，不给镜头分配精确帧。定稿解说词和导演设计进入 FilmPlan 后，FilmPlan 仍是动态分镜与正式视频的唯一时间依据。参考片只供分析可复用方法，不限制后续作品的视觉风格。

## 当前边界

- OpenMontage 的完整编排器、渲染器选择、云端供应商评分和素材库没有接入 GENCAN。Remotion 继续承担正式视频时间轴；Anatomy 只处理需要拆解的机制。
- 仓库内的品牌图、吉祥物和演示视频不作为 GENCAN 通用素材；保留的字体仅按其独立 OFL 授权使用。OpenMontage 的库存媒体来自外部来源，必须逐条核对具体文件的使用条件。
- 研究、配音、字幕等辅助工具仍按每期实际需要与授权选用。上游的工具清单只能作为候选来源，不能证明本机已配置或素材可商用。
- 提案中的开场与镜头是可比较的创意草案。只有 FilmPlan 校验和实际动态分镜能验证时间与画面衔接；声画同步需要定稿音频后再审。
