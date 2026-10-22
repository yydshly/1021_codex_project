// Original creative plan and actual generation results.
window.CREATIVE_CASE = {
  "id": "rain-to-forest",
  "title": "把森林，带回城市",
  "format": "16 秒香水概念片 · 16:9",
  "duration": 16,
  "generationStatus": "generated",
  "brief": "为一款虚构的木质香调香水设计概念片：面向渴望安静的城市生活者，把气味表现成雨夜中出现的森林记忆。画面克制、神秘，不使用讲解旁白。",
  "concept": "圆形水纹与瓶盖建立视觉联系，瓶身倒影把森林带入城市，最后用安静的留白完成品牌落点。",
  "anchorZh": "同一只 50ml 圆柱形琥珀玻璃香水瓶，抛光银色圆形瓶盖，无文字标签。雨夜屋顶上的湿黑色石板，冷蓝城市散景，克制的暖琥珀轮廓光。",
  "anchorEn": "The same 50 ml cylindrical amber-glass perfume bottle with a polished circular silver cap and no printed label. Wet black slate on a rainy rooftop, cool blue city bokeh, restrained warm amber rim light.",
  "newDecisions": [
    "把木质香气具象化为玻璃和金属表面里的雪松倒影。",
    "用水纹与瓶盖的共同圆形连接城市环境和产品，不使用形变转场。",
    "先隐藏产品、再揭示外形，最后为后期品牌文案留出空间。"
  ],
  "productionNote": "统一产品参考图由内置图片生成功能制作。Seedance 2.0 分别生成四段 5 秒素材，后期剪成 3＋4＋5＋4 秒；中文文案与雨声衔接由后期完成。下方分别展示实际生成素材、设计提示词与本次观察。",
  "shots": [
    {
      "id": "s1",
      "title": "城市的一滴雨",
      "duration": 3,
      "role": "用一个细节建立悬念，先让观众感到城市的寒冷。",
      "visual": "垂直俯视湿石板上的圆形小水洼，一滴雨落下，中心扩散出一道水纹。",
      "primaryMotion": "摄影机固定，仅水纹运动",
      "refIds": [
        "lenses-macro",
        "atmosphere-rain"
      ],
      "borrowedRule": "借用微距的细节尺度，以及逆光雨滴和湿表面表现天气的方法。",
      "creativeDecision": "将圆形水纹设为全片的视觉母题，并预留与下一个镜头匹配的位置。",
      "promptZh": "3 秒，16:9。雨夜屋顶上湿黑色石板的垂直俯拍微距。一个圆形小水洼位于画面中心，直径约占画面高度的 44%。一滴雨落在圆心，只形成一圈清楚扩散的水纹。冷蓝城市灯光倒映在水面，一侧有微弱琥珀色反光。摄影机与焦距完全固定，石板纹理稳定，保持真实液体运动。香水瓶尚不进入画面，画面没有文字。",
      "promptEn": "3 seconds, 16:9. Locked top-down macro view of wet black slate on a rainy rooftop. A small circular puddle is centered, about 44 percent of frame height in diameter. One raindrop lands at its center and creates one clearly expanding ring. Cool blue city lights reflect in the water with a faint amber reflection along one edge. Keep the camera, focal length and stone texture stable, with coherent liquid motion. The perfume bottle is outside the frame. No lettering.",
      "editNote": "记录水纹的圆心与直径；在水纹轮廓清楚的一帧切出，供镜头 2 对齐。",
      "generated": {
        "video": "generated/rain-to-forest/s1.mp4",
        "poster": "generated/rain-to-forest/s1.jpg",
        "duration": 5,
        "model": "Seedance 2.0",
        "observation": "雨滴与水纹运动可见；实际机位更偏斜俯拍，未达到设计中的严格垂直俯拍。"
      }
    },
    {
      "id": "s2",
      "title": "一个圆，连接两种世界",
      "duration": 4,
      "role": "让产品第一次出现，同时暗示香气里的森林。",
      "visual": "水纹硬切为同位置、同大小的银色圆形瓶盖，金属表面倒映雪松枝叶。",
      "primaryMotion": "固定机位，倒影中只有轻微枝叶运动",
      "refIds": [
        "editing-graphic-match",
        "lenses-macro",
        "composition-reflections"
      ],
      "borrowedRule": "借用图形匹配的轮廓、大小和位置对齐，以及通过反射在一幅画面里容纳两个空间。",
      "creativeDecision": "把表盘与穹顶之类的原站例子，重新设计为水纹和香水瓶盖，建立雨夜与木质香调的联系。",
      "promptZh": "4 秒，16:9。垂直俯拍同一只 50ml 圆柱形琥珀玻璃香水瓶的抛光银色圆形瓶盖。瓶盖圆心位于画面中心，直径约占画面高度的 44%，与前镜水纹对齐。瓶盖表面从第一帧就有清楚、稳定的雪松枝叶倒影，枝叶仅轻微摇动。周围保留湿黑石板与冷蓝、暖琥珀反光。摄影机固定，瓶盖边缘不变形，没有文字。",
      "promptEn": "4 seconds, 16:9. Locked top-down macro view of the polished circular silver cap on the same 50 ml cylindrical amber-glass perfume bottle. Center the cap at 44 percent of frame height in diameter to match the preceding water ring. From the first frame, its surface contains a clear, stable reflection of cedar branches with only a slight leaf movement. Retain wet black slate, cool blue reflections and restrained amber accents. Keep the camera fixed and the cap contour rigid. No lettering.",
      "editNote": "镜头 1 与 2 分别生成，在剪辑中按圆心和大小硬切；不让模型在同一段中把水变成金属。",
      "generated": {
        "video": "generated/rain-to-forest/s2.mp4",
        "poster": "generated/rain-to-forest/s2.jpg",
        "duration": 5,
        "model": "Seedance 2.0",
        "observation": "瓶盖微距与雪松倒影可见，构图稳定；与水纹主要形成形状呼应，并非完全相同的透视圆形。"
      }
    },
    {
      "id": "s3",
      "title": "绕过瓶身，发现森林",
      "duration": 5,
      "role": "完整展示产品，让森林倒影成为气味的视觉表达。",
      "visual": "同一只香水瓶立在雨夜石板上，摄影机向左环绕 90 度，雪松倒影滑过琥珀玻璃。",
      "primaryMotion": "固定距离，向左弧线环绕 90 度",
      "refIds": [
        "camera-movement-arc-left",
        "composition-reflections"
      ],
      "borrowedRule": "借用弧线环绕中持续面向主体、距离稳定、背景随视点改变的规则。",
      "creativeDecision": "把一次普通产品环绕变成一次发现：城市仍在瓶外，森林只存在于玻璃的倒影里。",
      "promptZh": "5 秒，16:9。同一只无文字标签的 50ml 圆柱形琥珀玻璃香水瓶，抛光银色圆形瓶盖，直立在雨夜屋顶的湿黑色石板上。冷蓝城市散景位于远处，暖琥珀色轮廓光勾出玻璃边缘。摄影机以恒定半径向左环绕 90 度，始终朝向瓶身，保持产品大小和焦距稳定。真实雨痕留在玻璃上，雪松树干的倒影随视角自然滑动。产品不旋转、不变形，城市环境保持连续。",
      "promptEn": "5 seconds, 16:9. The same unlabeled 50 ml cylindrical amber-glass perfume bottle with its polished circular silver cap stands on wet black slate on a rainy rooftop. Cool blue city bokeh sits in the distance; restrained amber rim light defines the glass. Arc the camera left by 90 degrees at a constant radius, always facing the bottle, with stable framing and focal length. Rain trails remain on the glass while reflected cedar trunks shift naturally with the viewpoint. The bottle stays still and rigid; the city environment remains continuous.",
      "editNote": "以统一产品参考图控制瓶型、瓶盖和色泽；不要同时要求产品自转或额外变焦。",
      "generated": {
        "video": "generated/rain-to-forest/s3.mp4",
        "poster": "generated/rain-to-forest/s3.jpg",
        "duration": 5,
        "model": "Seedance 2.0",
        "observation": "背景与玻璃倒影随视点移动，瓶型保持稳定；具体环绕角度未做定量测量。"
      }
    },
    {
      "id": "s4",
      "title": "给安静留一个位置",
      "duration": 4,
      "role": "停留在产品与情绪上，为品牌落版提供空间。",
      "visual": "香水瓶位于左侧三分区，右侧留白；城市薄雾被一束合理的街灯光照亮。",
      "primaryMotion": "固定机位，薄雾缓慢流动",
      "refIds": [
        "composition-negative-space",
        "lighting-volumetric-light"
      ],
      "borrowedRule": "借用留白控制视觉重心，以及可见光束在薄雾中建立空间层次的方法。",
      "creativeDecision": "将压迫性的城市空白转成可呼吸的广告空间，文案留给后期完成。",
      "promptZh": "4 秒，16:9。同一只 50ml 琥珀玻璃香水瓶与银色圆形瓶盖，直立于湿黑石板，放在画面左侧三分区，玻璃上保留克制的雪松倒影。右侧约 55% 画面保持干净的深蓝留白，适合后期加文案。远处城市灯光柔和失焦，一盏画外街灯从右上方照亮缓慢流动的薄雾，产生一束细而可信的暖光。摄影机与产品固定，主体清晰，雾不遮住产品，不生成文字或标志。",
      "promptEn": "4 seconds, 16:9. The same 50 ml amber-glass perfume bottle and circular silver cap stand on wet black slate in the left third of the frame, retaining a restrained cedar reflection in the glass. Keep approximately 55 percent of the right side as clean deep-blue negative space for later typography. Distant city lights are softly defocused. One off-screen streetlamp from the upper right illuminates slowly drifting light haze with a narrow, plausible warm beam. Lock the camera and bottle, keep the product sharp and unobscured, and generate no text or logos.",
      "editNote": "后期加入“把森林，带回城市”。街灯暖光方向与前镜轮廓光保持一致；必要时用静帧延长停留。",
      "generated": {
        "video": "generated/rain-to-forest/s4.mp4",
        "poster": "generated/rain-to-forest/s4.jpg",
        "duration": 5,
        "model": "Seedance 2.0",
        "observation": "产品位于左侧，右侧留白与雾中暖光可见。原始素材没有文字，成片文案由后期加入。"
      }
    }
  ],
  "generationSummary": "原创成片已生成 · 16 秒 · 1080p · 可播放与下载",
  "generated": {
    "video": "generated/rain-to-forest/rain-to-forest.mp4",
    "poster": "generated/rain-to-forest/poster.jpg",
    "duration": 16,
    "model": "Seedance 2.0",
    "resolution": "1920x1080",
    "fps": 24,
    "generatedAt": "2026-10-22",
    "estimatedCredits": 480,
    "serviceReportedCredits": 600,
    "accountDeductionVerified": false,
    "costNote": "估算工具给出每段 120 点；服务结果每段标记 150 点。查询时账户余额未变化，实际扣费未确认。"
  }
};
