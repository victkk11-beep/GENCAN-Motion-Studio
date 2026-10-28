import {validateFilmPlan} from './film-plan.ts';

const c = (frame: number, x: number, y: number, scale: number, easing: 'hold' | 'linear' | 'smooth' = 'smooth') => ({frame, pose: {target: {x, y}, scale}, easing});
const k = (frame: number, x: number, y: number, scale = 1, opacity = 1) => ({frame, x, y, scale, opacity});

// One source of timing for both the director plan and the animatic.
export const samplePlan = validateFilmPlan({
  version: 1,
  id: 'context-thread',
  brief: {title: '把思路接回来', audience: '知识讲解视频观众', learningGoal: '看懂中断、保存线索与恢复思路的关系'},
  video: {width: 1080, height: 1920, fps: 30, durationFrames: 450},
  audio: {status: 'placeholder', asset: null},
  beats: [
    {id: 'focus', startFrame: 0, endFrame: 90, before: '尚未认出主角', change: '聚光锁定思路', after: '认出思路节点'},
    {id: 'interrupt', startFrame: 90, endFrame: 180, before: '思路稳定', change: '消息闯入', after: '注意力改变'},
    {id: 'save', startFrame: 180, endFrame: 300, before: '线索可能丢失', change: '节点进入保存位', after: '线索有处可回'},
    {id: 'restore', startFrame: 300, endFrame: 450, before: '节点留在保存位', change: '节点回原位', after: '思路继续'},
  ],
  worlds: [{id: 'workbench', objects: [
    {id: 'thought', kind: 'thought', label: '思路节点', keys: [k(0,540,875),k(105,540,875),k(145,410,900,.92),k(185,410,900,.92),k(260,540,1290,.52),k(315,540,1290,.52),k(380,540,875),k(450,540,875)]},
    {id: 'notification', kind: 'notification', label: '外部消息', keys: [k(0,1030,725,1,0),k(93,1030,725,1,0),k(128,765,725),k(170,765,725),k(220,860,725,.85,0),k(450,860,725,.85,0)]},
    {id: 'save-slot', kind: 'save-slot', label: '线索保存位', keys: [k(0,540,1320,1,0),k(182,540,1320,1,0),k(215,540,1320),k(450,540,1320)]},
    {id: 'saved-row', kind: 'saved-row', label: '已保存线索', keys: [k(0,540,1510,1,0),k(260,540,1470,1,0),k(290,540,1510),k(310,540,1510),k(360,540,1510,1,0),k(450,540,1510,1,0)]},
  ]}],
  markers: [
    {id: 'focus', frame: 34, kind: 'action', text: '聚光找到主角'},
    {id: 'push', frame: 114, kind: 'action', text: '一次短促推近'},
    {id: 'save', frame: 260, kind: 'action', text: '同一节点进入保存位'},
    {id: 'restore', frame: 380, kind: 'action', text: '同一节点回原位'},
  ],
  shots: [
    {id:'s01',beatId:'focus',worldId:'workbench',startFrame:0,endFrame:90,purpose:'先认出主角',focusObjectId:'thought',caption:'先看见正在延伸的思路',camera:[c(0,540,960,1),c(30,540,900,1.04),c(90,540,900,1.04,'hold')],transitionOut:{kind:'continuous'}},
    {id:'s02',beatId:'interrupt',worldId:'workbench',startFrame:90,endFrame:180,purpose:'消息改变注意力',focusObjectId:'notification',caption:'一个消息，改变了注意力',camera:[c(90,540,900,1.04),c(108,540,900,1.04,'hold'),c(114,655,780,1.32),c(180,655,780,1.32,'hold')],transitionOut:{kind:'anchor-bridge',anchorObjectId:'thought',targetObjectId:'save-slot',durationFrames:65,clearFrame:390}},
    {id:'s03',beatId:'save',worldId:'workbench',startFrame:180,endFrame:300,purpose:'跟随同一节点',focusObjectId:'save-slot',caption:'离开前，把线索留在这里',camera:[c(180,655,780,1.32),c(245,540,1100,1.12),c(300,540,1100,1.12,'hold')],transitionOut:{kind:'continuous'}},
    {id:'s04',beatId:'restore',worldId:'workbench',startFrame:300,endFrame:450,purpose:'回到全景并停留',focusObjectId:'thought',caption:'回来时，从这条线索继续',camera:[c(300,540,1100,1.12),c(380,540,960,1),c(450,540,960,1,'hold')],transitionOut:{kind:'cut'}},
  ],
});
