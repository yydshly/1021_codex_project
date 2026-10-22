window.STUDIO_DATA = {
  "library": {
    "schemaVersion": 1,
    "scope": "首批 7 项技巧规则。用于检索、创作约束与提示词整理；不是视频模型的精确运动控制接口。",
    "rules": [
      {
        "id": "lenses-macro",
        "kind": "optics",
        "core": "放大小尺度细节，明确清晰焦点及焦外关系；微距本身不要求摄影机移动。",
        "coreOrigin": "由原提示词的细节与景深要求提炼；独立于运镜为本项目归纳。",
        "sourceExcerpt": "The screw head and adjacent gear teeth are crisp; focus falls away rapidly.",
        "purposes": [
          "让材质与细小动作可读",
          "以局部细节建立注意力"
        ],
        "purposeOrigin": "设计推断，作为候选用途，不是固定情绪映射。",
        "keywords": [
          "微距",
          "细节",
          "纸纤维",
          "针脚",
          "手工",
          "材质",
          "macro",
          "texture",
          "detail"
        ],
        "parameters": [
          {
            "key": "focusTarget",
            "label": "清晰焦点",
            "type": "bilingual_text",
            "origin": "原提示词要求，具体对象由新设计填写"
          },
          {
            "key": "view",
            "label": "机位与景别",
            "type": "bilingual_text",
            "origin": "新设计参数，微距不等于垂直俯拍"
          }
        ],
        "requirements": [
          "写出具体焦点和一个可读动作",
          "对需要看清的接触点保留足够景深"
        ],
        "cautions": [
          "小尺度、手指和道具可能发生形变；必须检查接触与比例",
          "严格俯拍需要单独约束和参考，不能由微距自动推出"
        ],
        "checks": [
          "关键细节是否清楚",
          "尺度、手和道具是否稳定",
          "机位是否符合本镜设计"
        ],
        "caseShotIds": [
          "s1",
          "s2"
        ],
        "caseLesson": "香水案例出现了水纹和瓶盖细节，但水纹机位偏斜；不能把微距成功等同于垂直俯拍成功。",
        "nameZh": "微距镜头",
        "nameEn": "Macro",
        "source": {
          "url": "https://melies.co/cinematic-techniques/lenses/macro",
          "checked": "2026-10-22",
          "promptSha256": "892131a3637ebaa3deb45157fc68765681ca9cfe0364469a772de7b866559622",
          "fullRecordFile": "capabilities.json"
        },
        "experience": {
          "caseId": "rain-to-forest",
          "recordFile": "case-library.json",
          "shotIds": [
            "s1",
            "s2"
          ],
          "sampleSize": 1,
          "evidenceStatus": "one_run_qualitative_review"
        },
        "caseFeedback": [
          {
            "caseId": "rain-to-forest",
            "title": "把森林，带回城市",
            "sampleSize": 1,
            "evidenceStatus": "one_run_qualitative_review",
            "limits": [
              "只有一套方案、一次执行，没有对照组、重复抽样或成功率统计。",
              "共享参考图与较一致的外观同时出现，不能据此证明参考图是唯一原因或保证后续一致性。",
              "未量化环绕角度、留白比例、反射的物理准确性；未开展受众感受或商业效果测试。",
              "候选改写没有再次生成，不能当作已验证的改进；结论仅限本次 Seedance 2.0 输出。"
            ],
            "reviewPriority": null,
            "revisions": [],
            "shots": [
              {
                "shotId": "s1",
                "intent": "先让观众进入冷湿的城市环境，再用一次水纹建立悬念和圆形母题。",
                "selectionReason": "微距把注意力集中在一个小动作上；雨景与湿表面建立触感和天气，使开场能够用环境细节而非旁白传达氛围。",
                "observedEffect": "雨滴与水纹运动可见；实际机位更偏斜俯拍，未达到设计中的严格垂直俯拍。",
                "problems": [
                  "水纹可见，但实际为斜俯拍，水洼与水纹呈椭圆，未达到严格垂直俯拍。",
                  "与下一镜瓶盖的投影形状不同，增加了图形匹配的难度。"
                ],
                "nextAttempt": {
                  "status": "proposed_unverified",
                  "action": "先准备真正垂直俯拍的水面构图参考，再保持单一水滴动作；只改变机位约束，便于比较是否改善。",
                  "promptRole": "在原提示词上替换机位描述的候选片段，不能脱离完整场景直接视为已验证提示词。",
                  "promptZh": "摄影机光轴垂直于石板，从正上方以 90 度俯拍，画面不出现地平线。水纹在画面中的投影保持圆形而非椭圆。摄影机固定，只出现一滴雨和一圈扩散水纹。",
                  "promptEn": "The camera optical axis is perpendicular to the slate, looking straight down from directly overhead at 90 degrees, with no visible horizon. The projected water ring is circular rather than elliptical. Lock the camera; show only one raindrop and one expanding ring.",
                  "check": "对比水纹的横纵直径与圆心位置，并核对是否仍有机位倾斜；不能只看是否出现了水纹。"
                }
              },
              {
                "shotId": "s2",
                "intent": "用圆形轮廓把雨夜环境接到香水产品，并第一次暗示木质香调。",
                "selectionReason": "图形匹配使切镜有视觉联系；瓶盖微距延续细节尺度，反射让城市空间和森林记忆同时出现在产品表面。",
                "observedEffect": "瓶盖微距与雪松倒影可见，构图稳定；与水纹主要形成形状呼应，并非完全相同的透视圆形。",
                "problems": [
                  "瓶盖和雪松倒影清楚，但与水纹没有形成相同的投影形状、尺寸和位置。",
                  "实际达到的是轮廓呼应，不能标记为精确图形匹配成功。"
                ],
                "nextAttempt": {
                  "status": "proposed_unverified",
                  "action": "先选定水纹切出帧，量取圆心、直径及投影轮廓；用同一构图标记准备瓶盖参考帧，再生成固定镜头，最后在剪辑中对齐。",
                  "promptRole": "候选机位与构图约束；方括号参数要在量取前镜后填写。",
                  "promptZh": "使用独立的瓶盖俯拍参考帧。瓶盖圆心位于画面归一化坐标【圆心 x、y】，投影直径为画面高度的【直径百分比】，与选定的水纹切出帧一致。保持机位与金属轮廓固定，不在镜头内让水面变成金属。",
                  "promptEn": "Use a dedicated overhead cap reference frame. Place the cap center at normalized frame coordinates [center x, y], with a projected diameter of [diameter percentage] of frame height, matching the selected outgoing ripple frame. Lock the camera and metal contour. Do not morph water into metal within the shot.",
                  "check": "在切点叠加比较两帧的轮廓、圆心与尺度；如果透视不同，先修正参考构图，避免仅靠字幕或溶解掩盖偏差。"
                }
              }
            ]
          },
          {
            "caseId": "book-repair",
            "title": "让故事，继续",
            "sampleSize": 1,
            "evidenceStatus": "one_run_qualitative_review",
            "limits": [
              "一套方案、一次执行；四个镜头不是四次独立复现实验，没有成功率或跨模型结论。",
              "单张合书身份参考与多镜沿用整本书构图同时出现，但未隔离参考模式、文字或模型因素，不能断言唯一原因。",
              "没有完成逐帧拓扑、光学或留白百分比的量测，不保证手、线、孔与反射等物理正确。",
              "音轨存在，已做技术解码与后期响度处理，但未进行听感、内容或声画同步验收，不能声称无音乐 / 无人声要求已全部实现。",
              "未做观众情绪、传播效果或真实修书工艺正确性验证；短片不是修复教学。",
              "候选构图图、首帧、接触点与留白改法均未再次生成，不可升级为已验证改进。"
            ],
            "reviewPriority": "先验收物体结构、动作作用位置、转轴与动作前后状态，再评价叙事表达与镜头呈现。仅为人工审片原则，不是网页的自动物理校验。",
            "revisions": [
              {
                "id": "book-repair-r2",
                "summary": "已只重做穿针与合书并剪回 18 秒：穿针从叠书／纸页外侧落点改为单一书体的中央折缝孔；合书从另一边翻起改为沿左侧长书脊放下同一前封面。刷拭和交还沿用首版素材与取材范围。穿针只展示小幅插入，未展示下侧出针与完整拉线。",
                "limits": [
                  "仍为香水、旧书两个题材；旧书为一次四镜首版加一次两镜局部返修，不新增第三个题材，也不把两镜算两个独立重复实验。",
                  "参考图、构图、动作范围、首尾约束和提示词同时变化，不是单变量实验，未测试其他模型或重复稳定性。",
                  "仅判断这两段可见入口位置与合书轴改善；完整装订工艺、精确运动几何和受众情绪未验证。",
                  "声音仅检查音轨存在和解码，未听评内容、接触同步或音色；不宣称音频内容达标。",
                  "刷拭与交还的原始文件及取材起止保持一致；最终成片重新编码与整片响度处理，不宣称输出逐像素或音频采样锁定。"
                ],
                "lessons": [
                  "先把对象结构与动作起止状态做对，再叠加镜头语言：本轮专用参考中先确定单一书体、中缝孔、固定页块和移动封面。它们与身份图承担不同任务。",
                  "开合类动作以物体自身的连接轴定义路径，同时追踪自由边与识别标记；画面左／右只能辅助描述，不能代替连接关系。该检查可迁移到盒盖、门、机械开合等新题材。",
                  "把复杂动作缩成一个清楚阶段，有助于这次画面表达：一针只推进同一孔，合书只从略抬到落平。代价是不能宣称展示了完整工艺或大幅度开合。",
                  "首尾图片正确仍需检查中间帧。验收作用点、接触、路径和终态；未看见针的出口与完整拉线，就单独保留验证缺口。",
                  "保留首版失败与局部返修的准确输入、参考、素材和剪辑范围；此次多项改动共同进行，只能记录局部改善，不能推导通用成功率或单一方法的因果结论。"
                ],
                "shots": [
                  {
                    "shotId": "book-2-r2",
                    "title": "穿针位置",
                    "assessment": "target_location_and_single_book_visually_improved",
                    "assessmentLabel": "孔位与书体改善 · 完整穿线未验证",
                    "change": "用一册打开的书与中央折缝孔的专用首尾帧，替换统一合书身份图；动作收窄为同一根针在同一孔的小幅插入，不再尝试完整针线循环。",
                    "observedEffect": "原片 0.1–9.85 秒始终可见一册打开的靛蓝书，直接放在亚麻书托上；针尖保持在中央折缝沿书脊线的同一既有孔，右手缓慢靠近，露出的针杆逐渐变短。未再出现首版的“开书叠在合书上”和针落在外侧纸面的关系。",
                    "problems": [
                      "动作幅度很小，接近缓慢推进与停留；不能把它描述为完整缝好一次。",
                      "针眼部分被手指遮挡，书帖下侧出针点与线穿透后的路径未显示，完整穿线连续性和工艺正确性仍未验证。",
                      "专用近景、书托、起始状态、首尾帧与文字约束共同变化，不能单独归因于某条提示词或首尾帧模式。"
                    ],
                    "check": "先认单一书体与中央折缝，再跟踪同一个孔和针尖；核对针没有换到外侧纸面或手指。入口改善与整条针线运动链分别验收，下侧不可见就保留未验证。",
                    "evidenceFrames": [
                      {
                        "image": "generated/book-repair-r2/evidence/needle-1s.jpg",
                        "sourceSeconds": 1,
                        "filmSeconds": 4.5,
                        "caption": "返修原片 1.00 秒 / 新成片 4.50 秒：单一开书，针尖对应中央折缝孔。"
                      },
                      {
                        "image": "generated/book-repair-r2/evidence/needle-3s.jpg",
                        "sourceSeconds": 3,
                        "filmSeconds": 6.5,
                        "caption": "返修原片 3.00 秒 / 新成片 6.50 秒：同一孔位，右手靠近，针杆缩短。"
                      },
                      {
                        "image": "generated/book-repair-r2/evidence/needle-6s.jpg",
                        "sourceSeconds": 6,
                        "filmSeconds": 9.5,
                        "caption": "返修原片 6.00 秒 / 新成片 9.50 秒：孔位与单一书体仍在，下侧出针不可见。"
                      }
                    ],
                    "before": {
                      "shotId": "book-2",
                      "actualMedia": {
                        "video": "https://github.com/yydshly/1021_codex_project/releases/download/melies-media-20261022/book-repair--book-2.mp4",
                        "poster": "generated/book-repair/book-2.jpg",
                        "duration": 10.048,
                        "width": 1902,
                        "height": 1092,
                        "frameRate": "24/1",
                        "videoCodec": "h264",
                        "hasAudio": true,
                        "byteSize": 6441698
                      },
                      "logicReview": {
                        "assessment": "not_passed",
                        "label": "动作逻辑未通过",
                        "basis": "assistant_visual_recheck_after_user_feedback",
                        "userFeedback": "穿针的位置不对。",
                        "expected": "按本方案预设，针应作用于同一本书书脊处既有装订孔；入口、出口与线的走向要能对应。不是泛化断言所有书籍装订都使用同一工艺。",
                        "observed": "针尖落在页片上的点位，打开的页块与下方合书形成疑似叠书结构，目标修复部位和书体关系没有成立。",
                        "check": "先确认只有一个书体、书脊和目标孔，再检查针入口—出口—线是否围绕同一孔连续，最后检查动作是否真的改变目标部位。",
                        "evidenceFrames": [
                          {
                            "image": "generated/book-repair/evidence/needle-4s.jpg",
                            "sourceSeconds": 4,
                            "filmSeconds": 7.5,
                            "caption": "原片 4.00 秒 / 成片 7.50 秒：针落点与疑似叠书结构。"
                          }
                        ]
                      }
                    },
                    "techniqueIds": [
                      "lenses-macro"
                    ],
                    "taskId": "1035124",
                    "actualInput": {
                      "en": "10 seconds, 16:9, one continuous locked close-up. Use the provided FIRST and LAST frames as the exact start and end states of ONE slow needle INSERTION, not a whole repair process. There is ONE open book on a linen cradle, not an open book stacked on a closed book. Identify the existing hole at the central paper FOLD/GUTTER on the spine line, immediately under the needle tip in the first frame. Keep that very hole fixed. Pause briefly, then move the same single needle point-first gradually deeper into that SAME existing center-fold hole, until about half the visible shaft has disappeared through it as in the last frame. Only one small insertion, then a quiet hold. Keep the visible thread connected to the same needle eye and following naturally. Do not pull a needle out elsewhere, create a new hole, sew through a page fore-edge, pierce fingers, repeat the stitch or pretend to finish the book. The underside and needle exit may remain occluded; do not invent a second exposed book. The left hand steadies the same paper section, the right thumb and forefinger follow the needle; keep the contact zone visible. Paper folds, existing stitches, covers and book count remain stable. Same aged indigo cloth, yellowed paper, linen sleeves, wooden worktable and soft morning light from the left. Camera and focus fixed, sufficient depth of field at hole and needle; no zoom, cuts, orbit, magic, particles, labels or text. No voices or music, only quiet workshop room tone and very soft contact sound.",
                      "translationZh": "10 秒，16:9，一个连续固定近景。用所给首帧与尾帧规定一次缓慢插针的起止状态，不演完整修书流程。只有一本打开并支在亚麻书托上的书，不是在合上的书上叠一本打开的书。目标是首帧针尖正下方、沿书脊线的纸张中央折缝／书沟上的既有孔；该孔位置固定。短暂停顿后，同一根针尖朝前缓慢深入同一个中央折缝孔，直到约一半可见针杆进入孔中，达到尾帧状态。只做一次小幅插入，再安静停留。可见线始终连在同一个针眼并自然跟随。不从别处抽出针，不造新孔，不穿纸张外沿，不扎手，不重复穿针，不假装完成整本书。下侧与出针点可以被遮挡，不凭空生成第二本暴露的书。左手稳住同一书帖，右手拇指和食指随针移动，接触区保持可见。纸折、既有针脚、封面与书的数量稳定。延续靛蓝旧布面、泛黄纸、亚麻袖口、木台与左侧柔和晨光。机位与焦点固定，孔和针附近景深充分；不变焦、切镜、环绕、魔法、粒子、标签或文字。无人声、无音乐，仅安静工作室底噪与很轻的接触声。",
                      "submittedLanguage": "en",
                      "translationStatus": "corresponding_translation_not_submitted",
                      "requestedDuration": 10,
                      "referenceRole": "dedicated_first_and_last_frames_not_only_identity"
                    },
                    "actualMedia": {
                      "video": "https://github.com/yydshly/1021_codex_project/releases/download/melies-media-20261022/book-repair-r2--book-2-r2.mp4",
                      "poster": "generated/book-repair-r2/book-2-r2.jpg",
                      "duration": 10.048,
                      "width": 1902,
                      "height": 1092,
                      "frameRate": "24/1",
                      "videoCodec": "h264",
                      "hasAudio": true,
                      "byteSize": 7995875
                    },
                    "referenceFrames": [
                      {
                        "role": "firstFrame",
                        "image": "https://github.com/yydshly/1021_codex_project/releases/download/melies-media-20261022/book-repair-r2--reference--needle-first.png"
                      },
                      {
                        "role": "endFrame",
                        "image": "https://github.com/yydshly/1021_codex_project/releases/download/melies-media-20261022/book-repair-r2--reference--needle-last.png"
                      }
                    ],
                    "edit": {
                      "timelineShotId": "book-2",
                      "sourceShotId": "book-2-r2",
                      "source": "assets/generated/book-repair-r2/book-2-r2/video_20261022141542.mp4",
                      "sourceSha256": "076ac80f21c5256ffe107ba25e30e00a25ab0a11a470e3d7834a7a82e3b34137",
                      "sourceStart": 0.5,
                      "duration": 6,
                      "timeline": {
                        "start": 4,
                        "end": 10
                      }
                    }
                  }
                ]
              }
            ],
            "shots": [
              {
                "shotId": "book-1",
                "intent": "先通过材料的脆弱与一次轻刷，引起对旧书的注意。",
                "selectionReason": "微距原本用于读清纸纤维和刷头接触；固定机位避免细节被额外运动分散。",
                "observedEffect": "靛蓝旧书、米色补布、亚麻袖口和左侧窗光可见；约 1–4.8 秒手持小刷在封面刷拭，旧物身份线索保留。",
                "problems": [
                  "画面仍包含整本书和较多工作台，未达到书脊纸纤维的微距尺度。",
                  "刷子主要扫向封面，包含多个短刷拭动作，没有严格沿磨损书脊轻刷一次。"
                ],
                "nextAttempt": {
                  "status": "proposed_unverified",
                  "action": "另备只包含书脊接触区的专用构图参考，将身份图与镜头构图区分；先只测试景别与刷头落点。",
                  "promptRole": "下一轮替换机位和动作范围的候选片段，未生成验证。",
                  "promptZh": "使用专用书脊近距构图：画面只含一小段磨损书脊、纸纤维与刷头，不展示整本封面。刷头从书脊左端到右端轻扫一次后停住，不扫封面，不往返。保持接触点在焦内。",
                  "promptEn": "Use a dedicated tight spine framing reference: show only a small frayed spine section, paper fibers and brush tip, not the entire cover. Make one gentle brush pass from the left end of this spine section to the right and stop. Do not brush the cover or move back and forth. Keep the contact point in focus.",
                  "check": "先核对景别是否真正排除整本书，再比较刷头路径、接触点与动作次数；不能以整体质感好代替微距达标。"
                }
              },
              {
                "shotId": "book-2",
                "intent": "用一次针线劳动，让照料成为可见动作，而非瞬间修复。",
                "selectionReason": "微距应读清针尖、线与已有装订孔的接触；将动作缩为一次穿孔，避免塞入完整修书流程。",
                "observedEffect": "约 0–4 秒针靠近并下移到纸页上的点位，约 5–9 秒手提针线；亚麻袖口、旧纸和工作台可见，动作集中在一次下移与提线。",
                "problems": [
                  "打开的书页与独立书壳看起来叠在一册合上的靛蓝旧书上，出现重复对象 / 结构不一致，不能确认是同一本书的正常打开状态。",
                  "本方案要求针穿书脊既有装订孔，实际针尖却落在打开页片偏外侧的点位，与目标作用位置不符；不能以出现针线和上下动作就判为装订成立。",
                  "画面仍含完整手和较大书体，没有达到针尖—孔—线的极近微距尺度。"
                ],
                "nextAttempt": {
                  "status": "proposed_unverified",
                  "action": "先画清单一书体与书脊装订孔的位置关系，准备孔位可辨的起始参考；只测试同一孔上的一次穿针，先验收作用位置和书体结构，再考虑微距效果。",
                  "promptRole": "候选对象数量、起始状态与接触约束，必须配合新的真实输入参考，不当作本轮历史输入。",
                  "promptZh": "画面中只有一本书，其已打开的书帖位于软书托上，下面没有合上的第二本书或额外书壳。近距构图显示书脊处一个已存在的装订孔，针尖在孔的入口外，单根线与针相连。只完成从该入口穿过到另一侧的一个动作；孔、纸与手的相对位置保持稳定。",
                  "promptEn": "Show exactly one book, its open section supported on a soft cradle, with no second closed book or extra cover underneath. A tight view shows one existing binding hole at the spine. The needle tip begins just outside its entrance, attached to one continuous thread. Perform only one pass through that entrance to the other side, keeping hole, paper and hand positions stable.",
                  "check": "先核对书体数量、书脊、目标孔与针的相对位置；再逐帧核对入口、出口和线的连续性。这里检验本方案的空间关系，不把候选描述当作专业修复工艺证明。"
                },
                "logicReview": {
                  "assessment": "not_passed",
                  "label": "动作逻辑未通过",
                  "basis": "assistant_visual_recheck_after_user_feedback",
                  "userFeedback": "穿针的位置不对。",
                  "expected": "按本方案预设，针应作用于同一本书书脊处既有装订孔；入口、出口与线的走向要能对应。不是泛化断言所有书籍装订都使用同一工艺。",
                  "observed": "针尖落在页片上的点位，打开的页块与下方合书形成疑似叠书结构，目标修复部位和书体关系没有成立。",
                  "check": "先确认只有一个书体、书脊和目标孔，再检查针入口—出口—线是否围绕同一孔连续，最后检查动作是否真的改变目标部位。",
                  "evidenceFrames": [
                    {
                      "image": "generated/book-repair/evidence/needle-4s.jpg",
                      "sourceSeconds": 4,
                      "filmSeconds": 7.5,
                      "caption": "原片 4.00 秒 / 成片 7.50 秒：针落点与疑似叠书结构。"
                    }
                  ]
                }
              }
            ]
          },
          {
            "caseId": "tea-moment",
            "title": "把片刻，留给自己",
            "sampleSize": 1,
            "evidenceStatus": "one_run_qualitative_review",
            "limits": [
              "一个题材方案的一次制作过程，包含两次无任务号的提交失败和一次经单独确认的触杯参考模式提交；三镜不计为三次独立验证。",
              "情绪判断来自模型对画面事件、状态和节奏的定性解释，尚无观众反馈；未听评音轨内容。",
              "没有量测跟拍距离、步长、三维坐标、精确固定焦距或杯子尺寸一致性。",
              "候选新提示词尚未执行；参考模式和文本同时改变，不能把提交成功归因于单一改动。"
            ],
            "reviewPriority": "先核对动作接触、脚步、主体停止与跨镜状态，再评价运镜和情绪；画面安静不能代替动作连续性成立。",
            "revisions": [],
            "shots": [
              {
                "shotId": "tea-1",
                "intent": "把注意力放到可触摸的日常细节，通过轻触与停顿建立人与器物的关系。",
                "selectionReason": "借用微距的细节关注，但按可读的杯柄接触布置景别；既要看到指尖，也要看清杯底仍在桌上。",
                "observedEffect": "开始时指尖与杯柄有空隙，约0.75–1.5秒拇指和食指靠近并接触杯柄上部，随后保持到末尾。单只杯子和下部蓝点持续可辨，杯底在可见画面中保持落桌，未见明显抬杯或洒茶。",
                "problems": [
                  "景别包含整只杯子，不是原站例子的极端微距；杯柄接触比陶面微观细节更突出。",
                  "实际日光与桌面高光较明显，未严格保持原设计的柔和漫射光。",
                  "这一次可见接触合理，未量测所有帧的指节几何、茶面变化或重复稳定性。"
                ],
                "nextAttempt": {
                  "status": "proposed_unverified",
                  "action": "如需更强触感，再单独测试更紧的接触局部和较柔的高光，保留杯底支撑与一次轻触。",
                  "check": "接触与杯底支撑仍可读，细节尺度改变后不出现穿模、漂浮或反复敲击。",
                  "promptRole": "未执行的新景别候选，不是本次准确提交文本",
                  "promptZh": "更紧地框住杯柄下连接处、指尖接触与一小段杯底支撑；柔和高光，轻触后保持，不新增动作。",
                  "promptEn": "Frame more tightly on the handle attachment, fingertip contact and a small readable portion of the supported cup base. Use gentle highlights and hold after one light touch, without adding another action."
                }
              }
            ]
          }
        ]
      },
      {
        "id": "atmosphere-rain",
        "kind": "atmosphere",
        "core": "用可见雨滴、照明和湿表面建立下雨的环境；雨的强度与场景由新设计决定。",
        "coreOrigin": "从原提示词的逆光雨滴、湿路面与天气声音提炼；强度可调为本项目归纳。",
        "sourceExcerpt": "Heavy cinematic rain around [Subject], backlit drops, wet-down pavement",
        "purposes": [
          "建立湿冷环境与触感",
          "以天气参与叙事"
        ],
        "purposeOrigin": "设计推断；雨景不固定对应悲伤或治愈。",
        "keywords": [
          "雨",
          "湿润",
          "雨夜",
          "水洼",
          "rain",
          "puddle",
          "wet"
        ],
        "parameters": [
          {
            "key": "rain",
            "label": "雨量、可见位置与湿表面",
            "type": "bilingual_text",
            "origin": "由原例抽出，原例的 heavy 不是必选强度"
          }
        ],
        "requirements": [
          "明确雨发生的位置与可见方式",
          "检查被淋湿的主体与材料是否合理"
        ],
        "cautions": [
          "不要为了气氛让室内纸张无理由淋雨",
          "不自动继承原例的伞、道路或银色雨丝"
        ],
        "checks": [
          "雨滴运动是否连贯",
          "湿表面反应是否一致",
          "天气是否服务本次目标"
        ],
        "caseShotIds": [
          "s1"
        ],
        "caseLesson": "香水案例的雨滴与水纹可见；天气表达不意味着所有液体运动与视角都精确可控。",
        "nameZh": "雨景",
        "nameEn": "Rain",
        "source": {
          "url": "https://melies.co/cinematic-techniques/atmosphere/rain",
          "checked": "2026-10-22",
          "promptSha256": "714c42c55d1b41eb7561c9f80ee88458aab93d7497fba94096f976f2cd02a2d4",
          "fullRecordFile": "capabilities.json"
        },
        "experience": {
          "caseId": "rain-to-forest",
          "recordFile": "case-library.json",
          "shotIds": [
            "s1"
          ],
          "sampleSize": 1,
          "evidenceStatus": "one_run_qualitative_review"
        },
        "caseFeedback": [
          {
            "caseId": "rain-to-forest",
            "title": "把森林，带回城市",
            "sampleSize": 1,
            "evidenceStatus": "one_run_qualitative_review",
            "limits": [
              "只有一套方案、一次执行，没有对照组、重复抽样或成功率统计。",
              "共享参考图与较一致的外观同时出现，不能据此证明参考图是唯一原因或保证后续一致性。",
              "未量化环绕角度、留白比例、反射的物理准确性；未开展受众感受或商业效果测试。",
              "候选改写没有再次生成，不能当作已验证的改进；结论仅限本次 Seedance 2.0 输出。"
            ],
            "reviewPriority": null,
            "revisions": [],
            "shots": [
              {
                "shotId": "s1",
                "intent": "先让观众进入冷湿的城市环境，再用一次水纹建立悬念和圆形母题。",
                "selectionReason": "微距把注意力集中在一个小动作上；雨景与湿表面建立触感和天气，使开场能够用环境细节而非旁白传达氛围。",
                "observedEffect": "雨滴与水纹运动可见；实际机位更偏斜俯拍，未达到设计中的严格垂直俯拍。",
                "problems": [
                  "水纹可见，但实际为斜俯拍，水洼与水纹呈椭圆，未达到严格垂直俯拍。",
                  "与下一镜瓶盖的投影形状不同，增加了图形匹配的难度。"
                ],
                "nextAttempt": {
                  "status": "proposed_unverified",
                  "action": "先准备真正垂直俯拍的水面构图参考，再保持单一水滴动作；只改变机位约束，便于比较是否改善。",
                  "promptRole": "在原提示词上替换机位描述的候选片段，不能脱离完整场景直接视为已验证提示词。",
                  "promptZh": "摄影机光轴垂直于石板，从正上方以 90 度俯拍，画面不出现地平线。水纹在画面中的投影保持圆形而非椭圆。摄影机固定，只出现一滴雨和一圈扩散水纹。",
                  "promptEn": "The camera optical axis is perpendicular to the slate, looking straight down from directly overhead at 90 degrees, with no visible horizon. The projected water ring is circular rather than elliptical. Lock the camera; show only one raindrop and one expanding ring.",
                  "check": "对比水纹的横纵直径与圆心位置，并核对是否仍有机位倾斜；不能只看是否出现了水纹。"
                }
              }
            ]
          }
        ]
      },
      {
        "id": "editing-graphic-match",
        "kind": "editing",
        "core": "分别准备两个不同物体的镜头，在相同形状、尺度和位置处硬切；本批规则以圆形匹配为明确的来源例子。",
        "coreOrigin": "原提示词明确要求双镜头、圆形、相同位置与大小及硬切。",
        "sourceExcerpt": "Hard-cut on the shared circle, with no morph or dissolve.",
        "purposes": [
          "在不同场景或对象之间建立形状联系"
        ],
        "purposeOrigin": "由原例与本项目案例归纳；不要求每个故事都使用匹配转场。",
        "keywords": [
          "图形匹配",
          "圆形转场",
          "轮廓衔接",
          "圆形匹配",
          "graphic match",
          "match cut"
        ],
        "parameters": [
          {
            "key": "matchId",
            "label": "相邻两镜共用的匹配标记",
            "type": "text",
            "origin": "本项目执行结构"
          },
          {
            "key": "centerX,centerY",
            "label": "归一化圆心",
            "type": "number",
            "origin": "由相同位置转为设计参数"
          },
          {
            "key": "diameterPercent",
            "label": "占画面高度的直径百分比",
            "type": "number",
            "origin": "由相同尺度转为设计参数；44%仅为香水方案目标"
          }
        ],
        "requirements": [
          "两镜必须相邻且都携带同一匹配标记和几何参数",
          "镜头内分别呈现各自的物体，后期完成硬切"
        ],
        "cautions": [
          "不能仅凭两个物体都圆就声称精确匹配",
          "透视不同需要先修正构图参考，不能依赖模型自动把物体变形连接"
        ],
        "checks": [
          "比较切点两帧的圆心、尺度和投影轮廓",
          "是否保持两个对象独立且没有形变转场"
        ],
        "caseShotIds": [
          "s2"
        ],
        "caseLesson": "香水案例只达到轮廓呼应，没有精确透视匹配；同尺寸位置的文字要求需要参考帧与剪辑复核。",
        "nameZh": "图形匹配剪辑",
        "nameEn": "Graphic Match",
        "source": {
          "url": "https://melies.co/cinematic-techniques/editing/graphic-match",
          "checked": "2026-10-22",
          "promptSha256": "dc4644367a75039d4d3db9d3c5ee262d748fdee411d31cd599d3a58d704ac1f9",
          "fullRecordFile": "capabilities.json"
        },
        "experience": {
          "caseId": "rain-to-forest",
          "recordFile": "case-library.json",
          "shotIds": [
            "s2"
          ],
          "sampleSize": 1,
          "evidenceStatus": "one_run_qualitative_review"
        },
        "caseFeedback": [
          {
            "caseId": "rain-to-forest",
            "title": "把森林，带回城市",
            "sampleSize": 1,
            "evidenceStatus": "one_run_qualitative_review",
            "limits": [
              "只有一套方案、一次执行，没有对照组、重复抽样或成功率统计。",
              "共享参考图与较一致的外观同时出现，不能据此证明参考图是唯一原因或保证后续一致性。",
              "未量化环绕角度、留白比例、反射的物理准确性；未开展受众感受或商业效果测试。",
              "候选改写没有再次生成，不能当作已验证的改进；结论仅限本次 Seedance 2.0 输出。"
            ],
            "reviewPriority": null,
            "revisions": [],
            "shots": [
              {
                "shotId": "s2",
                "intent": "用圆形轮廓把雨夜环境接到香水产品，并第一次暗示木质香调。",
                "selectionReason": "图形匹配使切镜有视觉联系；瓶盖微距延续细节尺度，反射让城市空间和森林记忆同时出现在产品表面。",
                "observedEffect": "瓶盖微距与雪松倒影可见，构图稳定；与水纹主要形成形状呼应，并非完全相同的透视圆形。",
                "problems": [
                  "瓶盖和雪松倒影清楚，但与水纹没有形成相同的投影形状、尺寸和位置。",
                  "实际达到的是轮廓呼应，不能标记为精确图形匹配成功。"
                ],
                "nextAttempt": {
                  "status": "proposed_unverified",
                  "action": "先选定水纹切出帧，量取圆心、直径及投影轮廓；用同一构图标记准备瓶盖参考帧，再生成固定镜头，最后在剪辑中对齐。",
                  "promptRole": "候选机位与构图约束；方括号参数要在量取前镜后填写。",
                  "promptZh": "使用独立的瓶盖俯拍参考帧。瓶盖圆心位于画面归一化坐标【圆心 x、y】，投影直径为画面高度的【直径百分比】，与选定的水纹切出帧一致。保持机位与金属轮廓固定，不在镜头内让水面变成金属。",
                  "promptEn": "Use a dedicated overhead cap reference frame. Place the cap center at normalized frame coordinates [center x, y], with a projected diameter of [diameter percentage] of frame height, matching the selected outgoing ripple frame. Lock the camera and metal contour. Do not morph water into metal within the shot.",
                  "check": "在切点叠加比较两帧的轮廓、圆心与尺度；如果透视不同，先修正参考构图，避免仅靠字幕或溶解掩盖偏差。"
                }
              }
            ]
          }
        ]
      },
      {
        "id": "camera-movement-arc-left",
        "kind": "motion",
        "core": "摄影机沿主体左侧弧线移动，并持续朝向主体；主体自转需要另行设计。",
        "coreOrigin": "沿左弧线与持续朝向直接来自原提示词；与自转区分为本项目归纳。",
        "sourceExcerpt": "The camera arcs left about 90 degrees around [Subject], always facing them.",
        "purposes": [
          "展示主体与背景的空间关系",
          "在视点变化中揭示信息"
        ],
        "purposeOrigin": "设计推断，不把环绕固定绑定到产品广告。",
        "keywords": [
          "环绕",
          "绕拍",
          "弧线",
          "侧面发现",
          "arc",
          "orbit"
        ],
        "parameters": [
          {
            "key": "arcDegrees",
            "label": "目标环绕角度",
            "type": "number",
            "example": 90,
            "origin": "原提示词的约 90 度是示例参数，不是实测能力"
          },
          {
            "key": "view",
            "label": "机位高度、距离与景别",
            "type": "bilingual_text",
            "origin": "新设计参数"
          }
        ],
        "requirements": [
          "摄影机运动明确为 arc_left",
          "同一镜头保持一个主要摄影机运动",
          "需要精确角度时明确起止视点并验收"
        ],
        "cautions": [
          "同时要求产品自转、环绕和变焦会增加相对运动歧义",
          "背景变化可见不能单独证明达到了 90 度"
        ],
        "checks": [
          "背景是否随视点移动",
          "主体大小和朝向是否符合设计",
          "起止视点是否支持目标角度"
        ],
        "caseShotIds": [
          "s3"
        ],
        "caseLesson": "香水案例的背景与倒影变化可见，瓶型较稳定；具体角度没有定量验证。",
        "nameZh": "向左弧线环绕",
        "nameEn": "Arc Left",
        "source": {
          "url": "https://melies.co/cinematic-techniques/camera-movement/arc-left",
          "checked": "2026-10-22",
          "promptSha256": "0c527cf376e4f3a632490d7d4792d78103b8aa901d0371d7f4c145f14fa2bd2a",
          "fullRecordFile": "capabilities.json"
        },
        "experience": {
          "caseId": "rain-to-forest",
          "recordFile": "case-library.json",
          "shotIds": [
            "s3"
          ],
          "sampleSize": 1,
          "evidenceStatus": "one_run_qualitative_review"
        },
        "caseFeedback": [
          {
            "caseId": "rain-to-forest",
            "title": "把森林，带回城市",
            "sampleSize": 1,
            "evidenceStatus": "one_run_qualitative_review",
            "limits": [
              "只有一套方案、一次执行，没有对照组、重复抽样或成功率统计。",
              "共享参考图与较一致的外观同时出现，不能据此证明参考图是唯一原因或保证后续一致性。",
              "未量化环绕角度、留白比例、反射的物理准确性；未开展受众感受或商业效果测试。",
              "候选改写没有再次生成，不能当作已验证的改进；结论仅限本次 Seedance 2.0 输出。"
            ],
            "reviewPriority": null,
            "revisions": [],
            "shots": [
              {
                "shotId": "s3",
                "intent": "让产品完整出现，通过相机运动与森林意象表现一次发现。",
                "selectionReason": "弧线环绕在持续面向产品的同时展示背景变化；反射将木质香气转为可见的森林意象，维持城市仍在瓶外的概念。",
                "observedEffect": "背景与玻璃倒影随视点移动，瓶型保持稳定；具体环绕角度未做定量测量。",
                "problems": [
                  "背景与倒影变化可见，但没有测量实际弧线是否达到 90 度。",
                  "未单独验证玻璃反射变化是否符合物理规律，不能把森林意象可见等同于反射控制精确。"
                ],
                "nextAttempt": {
                  "status": "proposed_unverified",
                  "action": "保留同一产品参考，增加可辨识的背景地标或起止视点参考；仅调整环绕约束，不叠加产品自转与变焦。",
                  "promptRole": "候选运动约束，保留原场景与产品锚点。",
                  "promptZh": "摄影机沿以香水瓶为中心的四分之一圆弧向左移动，起止视点相差 90 度，半径、机位高度和焦距保持不变。始终面向瓶身，产品静止不自转，背景地标随视点产生连贯位移。",
                  "promptEn": "Move the camera left along a quarter-circle arc centered on the perfume bottle, with a 90-degree change between the starting and ending viewpoints. Keep radius, camera height and focal length constant. Always face the bottle; keep the product stationary without rotation, while background landmarks shift coherently with the viewpoint.",
                  "check": "以明确的起止视点或背景地标核对角度和方向，并逐帧查看瓶型是否漂移；对称圆瓶的外观本身不足以证明环绕角度。"
                }
              }
            ]
          }
        ]
      },
      {
        "id": "composition-reflections",
        "kind": "composition",
        "core": "明确反射表面、被反射内容与照明关系，让主体和倒影在空间上可解释。",
        "coreOrigin": "从原提示词的玻璃、照明变化、位置一致与光学合理性提炼。",
        "sourceExcerpt": "Keep their positions consistent and the reflection optically plausible.",
        "purposes": [
          "在同一画面中联系两个空间",
          "用倒影承载记忆或感受的意象"
        ],
        "purposeOrigin": "第二项为香水案例的创意归纳，不是原例的固定剧情。",
        "keywords": [
          "反射",
          "倒影",
          "镜面",
          "玻璃",
          "reflection",
          "mirror",
          "glass"
        ],
        "parameters": [
          {
            "key": "reflection",
            "label": "反射表面、内容与关系",
            "type": "bilingual_text",
            "origin": "由原例抽取，内容与材料可改写"
          }
        ],
        "requirements": [
          "指定真实可反射的表面",
          "明确反射内容与主体的关系"
        ],
        "cautions": [
          "避免不可解释的重复主体",
          "意象可见不等于反射物理已验证",
          "哑光纸张不能直接套用玻璃镜面要求"
        ],
        "checks": [
          "倒影位置与视点变化是否连贯",
          "反射是否影响主体识别",
          "意象是否服务本次故事"
        ],
        "caseShotIds": [
          "s2",
          "s3"
        ],
        "caseLesson": "森林意象在瓶身与瓶盖中出现；其语义效果与反射物理准确性均未单独验证。",
        "nameZh": "反射构图",
        "nameEn": "Reflections",
        "source": {
          "url": "https://melies.co/cinematic-techniques/composition/reflections",
          "checked": "2026-10-22",
          "promptSha256": "79a5b3aedc0e5ada08a63d7b652e3b920b8534bcc36a3b8b12296be803e913dc",
          "fullRecordFile": "capabilities.json"
        },
        "experience": {
          "caseId": "rain-to-forest",
          "recordFile": "case-library.json",
          "shotIds": [
            "s2",
            "s3"
          ],
          "sampleSize": 1,
          "evidenceStatus": "one_run_qualitative_review"
        },
        "caseFeedback": [
          {
            "caseId": "rain-to-forest",
            "title": "把森林，带回城市",
            "sampleSize": 1,
            "evidenceStatus": "one_run_qualitative_review",
            "limits": [
              "只有一套方案、一次执行，没有对照组、重复抽样或成功率统计。",
              "共享参考图与较一致的外观同时出现，不能据此证明参考图是唯一原因或保证后续一致性。",
              "未量化环绕角度、留白比例、反射的物理准确性；未开展受众感受或商业效果测试。",
              "候选改写没有再次生成，不能当作已验证的改进；结论仅限本次 Seedance 2.0 输出。"
            ],
            "reviewPriority": null,
            "revisions": [],
            "shots": [
              {
                "shotId": "s2",
                "intent": "用圆形轮廓把雨夜环境接到香水产品，并第一次暗示木质香调。",
                "selectionReason": "图形匹配使切镜有视觉联系；瓶盖微距延续细节尺度，反射让城市空间和森林记忆同时出现在产品表面。",
                "observedEffect": "瓶盖微距与雪松倒影可见，构图稳定；与水纹主要形成形状呼应，并非完全相同的透视圆形。",
                "problems": [
                  "瓶盖和雪松倒影清楚，但与水纹没有形成相同的投影形状、尺寸和位置。",
                  "实际达到的是轮廓呼应，不能标记为精确图形匹配成功。"
                ],
                "nextAttempt": {
                  "status": "proposed_unverified",
                  "action": "先选定水纹切出帧，量取圆心、直径及投影轮廓；用同一构图标记准备瓶盖参考帧，再生成固定镜头，最后在剪辑中对齐。",
                  "promptRole": "候选机位与构图约束；方括号参数要在量取前镜后填写。",
                  "promptZh": "使用独立的瓶盖俯拍参考帧。瓶盖圆心位于画面归一化坐标【圆心 x、y】，投影直径为画面高度的【直径百分比】，与选定的水纹切出帧一致。保持机位与金属轮廓固定，不在镜头内让水面变成金属。",
                  "promptEn": "Use a dedicated overhead cap reference frame. Place the cap center at normalized frame coordinates [center x, y], with a projected diameter of [diameter percentage] of frame height, matching the selected outgoing ripple frame. Lock the camera and metal contour. Do not morph water into metal within the shot.",
                  "check": "在切点叠加比较两帧的轮廓、圆心与尺度；如果透视不同，先修正参考构图，避免仅靠字幕或溶解掩盖偏差。"
                }
              },
              {
                "shotId": "s3",
                "intent": "让产品完整出现，通过相机运动与森林意象表现一次发现。",
                "selectionReason": "弧线环绕在持续面向产品的同时展示背景变化；反射将木质香气转为可见的森林意象，维持城市仍在瓶外的概念。",
                "observedEffect": "背景与玻璃倒影随视点移动，瓶型保持稳定；具体环绕角度未做定量测量。",
                "problems": [
                  "背景与倒影变化可见，但没有测量实际弧线是否达到 90 度。",
                  "未单独验证玻璃反射变化是否符合物理规律，不能把森林意象可见等同于反射控制精确。"
                ],
                "nextAttempt": {
                  "status": "proposed_unverified",
                  "action": "保留同一产品参考，增加可辨识的背景地标或起止视点参考；仅调整环绕约束，不叠加产品自转与变焦。",
                  "promptRole": "候选运动约束，保留原场景与产品锚点。",
                  "promptZh": "摄影机沿以香水瓶为中心的四分之一圆弧向左移动，起止视点相差 90 度，半径、机位高度和焦距保持不变。始终面向瓶身，产品静止不自转，背景地标随视点产生连贯位移。",
                  "promptEn": "Move the camera left along a quarter-circle arc centered on the perfume bottle, with a 90-degree change between the starting and ending viewpoints. Keep radius, camera height and focal length constant. Always face the bottle; keep the product stationary without rotation, while background landmarks shift coherently with the viewpoint.",
                  "check": "以明确的起止视点或背景地标核对角度和方向，并逐帧查看瓶型是否漂移；对称圆瓶的外观本身不足以证明环绕角度。"
                }
              }
            ]
          }
        ]
      },
      {
        "id": "composition-negative-space",
        "kind": "composition",
        "core": "用主体与大片空白的空间关系组织注意力；空白方向、比例及用途随创作意图设计。",
        "coreOrigin": "从原提示词的大面积空墙与人物偏置提炼；广告文案空间来自本项目归纳。",
        "sourceExcerpt": "Most of the frame is pale wall and high windows.",
        "purposes": [
          "为后期文案预留位置",
          "用空间关系表达距离或停留"
        ],
        "purposeOrigin": "可选设计用途；留白不固定对应孤独，也不总是用来放广告。",
        "keywords": [
          "留白",
          "文案",
          "片名",
          "落版",
          "空白",
          "negative space",
          "typography"
        ],
        "parameters": [
          {
            "key": "negativeSpace.side",
            "label": "空白所在侧",
            "type": "enum",
            "values": [
              "left",
              "right"
            ],
            "origin": "本项目试点参数"
          },
          {
            "key": "negativeSpace.percent",
            "label": "目标空白比例",
            "type": "number",
            "example": 55,
            "origin": "55%为香水案例设计目标，未量测验证"
          },
          {
            "key": "negativeSpace.subjectPlacement",
            "label": "主体位置",
            "type": "bilingual_text",
            "origin": "由新设计确定"
          }
        ],
        "requirements": [
          "明确空白的叙事用途和主体位置",
          "有文字时检查实际文案安全区"
        ],
        "cautions": [
          "不继承原例的人物、候车室或凝视方向",
          "文案可读性需要后期排字和尺寸检查"
        ],
        "checks": [
          "主体与空白关系是否清楚",
          "文字区域是否被运动或光束遮挡",
          "比例是否量取后再宣称达标"
        ],
        "caseShotIds": [
          "s4"
        ],
        "caseLesson": "香水结尾保留了产品左置与右侧文案空间，55%比例未量取；中文是后期加入。",
        "nameZh": "留白构图",
        "nameEn": "Negative Space",
        "source": {
          "url": "https://melies.co/cinematic-techniques/composition/negative-space",
          "checked": "2026-10-22",
          "promptSha256": "5cc4439e27c07a365c19b07e7e42c21088de28f313bbbe4f86bfde6727353dd0",
          "fullRecordFile": "capabilities.json"
        },
        "experience": {
          "caseId": "rain-to-forest",
          "recordFile": "case-library.json",
          "shotIds": [
            "s4"
          ],
          "sampleSize": 1,
          "evidenceStatus": "one_run_qualitative_review"
        },
        "caseFeedback": [
          {
            "caseId": "rain-to-forest",
            "title": "把森林，带回城市",
            "sampleSize": 1,
            "evidenceStatus": "one_run_qualitative_review",
            "limits": [
              "只有一套方案、一次执行，没有对照组、重复抽样或成功率统计。",
              "共享参考图与较一致的外观同时出现，不能据此证明参考图是唯一原因或保证后续一致性。",
              "未量化环绕角度、留白比例、反射的物理准确性；未开展受众感受或商业效果测试。",
              "候选改写没有再次生成，不能当作已验证的改进；结论仅限本次 Seedance 2.0 输出。"
            ],
            "reviewPriority": null,
            "revisions": [],
            "shots": [
              {
                "shotId": "s4",
                "intent": "在情绪稳定后停留于产品，为片名与核心信息留下可读空间。",
                "selectionReason": "留白让文字和产品各有位置；雾中暖光延续琥珀配色，为安静的落版增加空间层次。",
                "observedEffect": "产品位于左侧，右侧留白与雾中暖光可见。原始素材没有文字，成片文案由后期加入。",
                "problems": [
                  "产品左置、右侧留白与暖光可见，但没有量取留白是否恰为 55%。",
                  "中文可读性来自后期排字，不能归功于视频模型的文字生成能力。"
                ],
                "nextAttempt": {
                  "status": "proposed_unverified",
                  "action": "复用结尾构图方法，在生成前用实际文案框检查安全区域；持续把最终文字交给后期完成。",
                  "promptRole": "可替换主体与文案区的候选约束，文字本身不交给视频模型生成。",
                  "promptZh": "将【产品】放在左侧三分区，右侧约【留白比例】保留干净的深色空间。薄雾和光束保持缓慢、克制，不遮挡主体或进入预留文案框。摄影机固定，不生成文字或标志；最终文案由后期加入。",
                  "promptEn": "Place [product] in the left third, reserving approximately [negative-space proportion] on the right as clean dark space. Keep haze and light beams slow and restrained, without obscuring the subject or entering the reserved typography box. Lock the camera and generate no text or logos; add final copy in post-production.",
                  "check": "在原尺寸和手机尺寸检查产品轮廓、文字对比度与文案安全区，量取比例后再声称数值达标。"
                }
              }
            ]
          },
          {
            "caseId": "book-repair",
            "title": "让故事，继续",
            "sampleSize": 1,
            "evidenceStatus": "one_run_qualitative_review",
            "limits": [
              "一套方案、一次执行；四个镜头不是四次独立复现实验，没有成功率或跨模型结论。",
              "单张合书身份参考与多镜沿用整本书构图同时出现，但未隔离参考模式、文字或模型因素，不能断言唯一原因。",
              "没有完成逐帧拓扑、光学或留白百分比的量测，不保证手、线、孔与反射等物理正确。",
              "音轨存在，已做技术解码与后期响度处理，但未进行听感、内容或声画同步验收，不能声称无音乐 / 无人声要求已全部实现。",
              "未做观众情绪、传播效果或真实修书工艺正确性验证；短片不是修复教学。",
              "候选构图图、首帧、接触点与留白改法均未再次生成，不可升级为已验证改进。"
            ],
            "reviewPriority": "先验收物体结构、动作作用位置、转轴与动作前后状态，再评价叙事表达与镜头呈现。仅为人工审片原则，不是网页的自动物理校验。",
            "revisions": [],
            "shots": [
              {
                "shotId": "book-4",
                "intent": "把修复完成转为人与人的交还，让故事继续的关系可见。",
                "selectionReason": "原设计把交还放在左侧，并用右侧约 40% 留白给后期片名；不依赖生成文字。",
                "observedEffect": "约 0.1–2 秒旧书从亚麻袖衣修复者移动到灰色毛衣袖口读者双手之间，约 2 秒后双方共同托书停留，两人的袖口身份和交还动作可读。",
                "problems": [
                  "手臂和交还动作占据画面中央及右侧，未形成要求的右侧约 40% 全高干净区域。",
                  "片名移到实际空出的右上墙面；这属于后期适配，不证明模型实现了指定留白比例。"
                ],
                "nextAttempt": {
                  "status": "proposed_unverified",
                  "action": "生成前先设计两人从画面左侧完成交接的构图，验证整段手臂运动都不进入右侧文案框；保留可读的袖口区分和共同托书停留。",
                  "promptRole": "新的布局与运动范围候选，未重新生成。",
                  "promptZh": "先用明确构图参考限定：书和两人的全部前臂、手掌，在整个交还过程中都保持于画面左侧六成区域；读者也从左侧或左后方接书。右侧四成文案区域在动作开始、接触和停留时都保持清空。保留亚麻袖口与灰色毛衣袖口，不生成片名。",
                  "promptEn": "Use an explicit framing reference: throughout the handover, keep the book and both people's entire forearms and hands within the left sixty percent of frame; the reader receives it from the left or rear-left. Keep the right forty percent title area clear at the start, contact and final pause. Retain linen sleeves and gray wool cuffs; generate no title.",
                  "check": "检查整段运动的范围，而非只看某个静止帧；叠加实际片名框后查看侵入和对比度，量取后再声称百分比达标。"
                }
              }
            ]
          }
        ]
      },
      {
        "id": "lighting-volumetric-light",
        "kind": "lighting",
        "core": "用光源与雾、尘等散射介质的关系让光束可见，借此组织空间层次。",
        "coreOrigin": "从原提示词的 haze、visible beams 与 dust 提炼；具体光源合理性为本项目执行约束。",
        "sourceExcerpt": "Volumetric god rays through haze around [Subject], visible beams, dust in the shaft",
        "purposes": [
          "让光线方向与空间层次可见",
          "将注意力引向行动或主体"
        ],
        "purposeOrigin": "设计推断；可见光束不自动产生崇高、安静或温暖。",
        "keywords": [
          "光束",
          "纸尘",
          "薄雾",
          "尘埃",
          "体积光",
          "haze",
          "beam",
          "dust"
        ],
        "parameters": [
          {
            "key": "volumetric",
            "label": "光源、方向与散射介质",
            "type": "bilingual_text",
            "origin": "由来源要素抽取，强度服从新目标"
          }
        ],
        "requirements": [
          "写明可解释的光源和散射介质",
          "保持产品或人物的识别中心可见"
        ],
        "cautions": [
          "不自动继承原例的教堂、森林或强烈神光",
          "避免把少量纸尘变成主导画面的粒子特效"
        ],
        "checks": [
          "光束方向是否与光源一致",
          "雾尘是否遮挡主体",
          "强度是否服从作品意图"
        ],
        "caseShotIds": [
          "s4"
        ],
        "caseLesson": "香水结尾可见暖光与薄雾；这只是本次画面观察，不代表已验证观众的情绪反应。",
        "nameZh": "体积光",
        "nameEn": "Volumetric Light",
        "source": {
          "url": "https://melies.co/cinematic-techniques/lighting/volumetric-light",
          "checked": "2026-10-22",
          "promptSha256": "d91c6a86373beaf4cae00fcd3f89851bd0e167292a25369aaeadb9fd2c5dcf94",
          "fullRecordFile": "capabilities.json"
        },
        "experience": {
          "caseId": "rain-to-forest",
          "recordFile": "case-library.json",
          "shotIds": [
            "s4"
          ],
          "sampleSize": 1,
          "evidenceStatus": "one_run_qualitative_review"
        },
        "caseFeedback": [
          {
            "caseId": "rain-to-forest",
            "title": "把森林，带回城市",
            "sampleSize": 1,
            "evidenceStatus": "one_run_qualitative_review",
            "limits": [
              "只有一套方案、一次执行，没有对照组、重复抽样或成功率统计。",
              "共享参考图与较一致的外观同时出现，不能据此证明参考图是唯一原因或保证后续一致性。",
              "未量化环绕角度、留白比例、反射的物理准确性；未开展受众感受或商业效果测试。",
              "候选改写没有再次生成，不能当作已验证的改进；结论仅限本次 Seedance 2.0 输出。"
            ],
            "reviewPriority": null,
            "revisions": [],
            "shots": [
              {
                "shotId": "s4",
                "intent": "在情绪稳定后停留于产品，为片名与核心信息留下可读空间。",
                "selectionReason": "留白让文字和产品各有位置；雾中暖光延续琥珀配色，为安静的落版增加空间层次。",
                "observedEffect": "产品位于左侧，右侧留白与雾中暖光可见。原始素材没有文字，成片文案由后期加入。",
                "problems": [
                  "产品左置、右侧留白与暖光可见，但没有量取留白是否恰为 55%。",
                  "中文可读性来自后期排字，不能归功于视频模型的文字生成能力。"
                ],
                "nextAttempt": {
                  "status": "proposed_unverified",
                  "action": "复用结尾构图方法，在生成前用实际文案框检查安全区域；持续把最终文字交给后期完成。",
                  "promptRole": "可替换主体与文案区的候选约束，文字本身不交给视频模型生成。",
                  "promptZh": "将【产品】放在左侧三分区，右侧约【留白比例】保留干净的深色空间。薄雾和光束保持缓慢、克制，不遮挡主体或进入预留文案框。摄影机固定，不生成文字或标志；最终文案由后期加入。",
                  "promptEn": "Place [product] in the left third, reserving approximately [negative-space proportion] on the right as clean dark space. Keep haze and light beams slow and restrained, without obscuring the subject or entering the reserved typography box. Lock the camera and generate no text or logos; add final copy in post-production.",
                  "check": "在原尺寸和手机尺寸检查产品轮廓、文字对比度与文案安全区，量取比例后再声称数值达标。"
                }
              }
            ]
          },
          {
            "caseId": "book-repair",
            "title": "让故事，继续",
            "sampleSize": 1,
            "evidenceStatus": "one_run_qualitative_review",
            "limits": [
              "一套方案、一次执行；四个镜头不是四次独立复现实验，没有成功率或跨模型结论。",
              "单张合书身份参考与多镜沿用整本书构图同时出现，但未隔离参考模式、文字或模型因素，不能断言唯一原因。",
              "没有完成逐帧拓扑、光学或留白百分比的量测，不保证手、线、孔与反射等物理正确。",
              "音轨存在，已做技术解码与后期响度处理，但未进行听感、内容或声画同步验收，不能声称无音乐 / 无人声要求已全部实现。",
              "未做观众情绪、传播效果或真实修书工艺正确性验证；短片不是修复教学。",
              "候选构图图、首帧、接触点与留白改法均未再次生成，不可升级为已验证改进。"
            ],
            "reviewPriority": "先验收物体结构、动作作用位置、转轴与动作前后状态，再评价叙事表达与镜头呈现。仅为人工审片原则，不是网页的自动物理校验。",
            "revisions": [
              {
                "id": "book-repair-r2",
                "summary": "已只重做穿针与合书并剪回 18 秒：穿针从叠书／纸页外侧落点改为单一书体的中央折缝孔；合书从另一边翻起改为沿左侧长书脊放下同一前封面。刷拭和交还沿用首版素材与取材范围。穿针只展示小幅插入，未展示下侧出针与完整拉线。",
                "limits": [
                  "仍为香水、旧书两个题材；旧书为一次四镜首版加一次两镜局部返修，不新增第三个题材，也不把两镜算两个独立重复实验。",
                  "参考图、构图、动作范围、首尾约束和提示词同时变化，不是单变量实验，未测试其他模型或重复稳定性。",
                  "仅判断这两段可见入口位置与合书轴改善；完整装订工艺、精确运动几何和受众情绪未验证。",
                  "声音仅检查音轨存在和解码，未听评内容、接触同步或音色；不宣称音频内容达标。",
                  "刷拭与交还的原始文件及取材起止保持一致；最终成片重新编码与整片响度处理，不宣称输出逐像素或音频采样锁定。"
                ],
                "lessons": [
                  "先把对象结构与动作起止状态做对，再叠加镜头语言：本轮专用参考中先确定单一书体、中缝孔、固定页块和移动封面。它们与身份图承担不同任务。",
                  "开合类动作以物体自身的连接轴定义路径，同时追踪自由边与识别标记；画面左／右只能辅助描述，不能代替连接关系。该检查可迁移到盒盖、门、机械开合等新题材。",
                  "把复杂动作缩成一个清楚阶段，有助于这次画面表达：一针只推进同一孔，合书只从略抬到落平。代价是不能宣称展示了完整工艺或大幅度开合。",
                  "首尾图片正确仍需检查中间帧。验收作用点、接触、路径和终态；未看见针的出口与完整拉线，就单独保留验证缺口。",
                  "保留首版失败与局部返修的准确输入、参考、素材和剪辑范围；此次多项改动共同进行，只能记录局部改善，不能推导通用成功率或单一方法的因果结论。"
                ],
                "shots": [
                  {
                    "shotId": "book-3-r2",
                    "title": "合书方向",
                    "assessment": "hinge_and_cover_direction_visually_improved_in_small_arc",
                    "assessmentLabel": "同一书脊合拢可读 · 小角度动作",
                    "change": "首帧只让前封面略微抬起，页块与后封面已经平放；左手稳书脊，右手沿自由边绕同一左侧长书脊放下，尾帧明确同一封面闭合状态。保留柔和窗光，暂不追求强化光束。",
                    "observedEffect": "原片约 0.1–1 秒前封面保持小角度抬起，约 1–3 秒右手随封面自由边下落，左侧长书脊与页块基本留在原位；约 3 秒后封面落平并停留。补布一直随同一前封面移动，没有首版从远侧短边竖起再翻合的明显轴关系矛盾。",
                    "problems": [
                      "起始动作从完全展开缩小为仅前封面略抬，不是首版整段展开动作的同幅度复现。",
                      "未量测精确旋转角度或逐点刚体误差；只作本段方向与连接关系的定性判断。",
                      "本轮不再强化体积光，不能用本镜证明该灯光规则已达标；跨镜布面磨损与补布形状仍有细节差异。"
                    ],
                    "check": "追踪同一左侧长书脊、移动封面、右侧自由边和补布；固定页块不被翻起，封面只绕同一长边下降，右手接触随动。最后合上不能代替中间轴关系检查。",
                    "evidenceFrames": [
                      {
                        "image": "generated/book-repair-r2/evidence/closure-0_1s.jpg",
                        "sourceSeconds": 0.1,
                        "filmSeconds": 10.1,
                        "caption": "返修原片 0.10 秒 / 新成片 10.10 秒：左侧书脊固定，右侧自由边抬起。"
                      },
                      {
                        "image": "generated/book-repair-r2/evidence/closure-1_75s.jpg",
                        "sourceSeconds": 1.75,
                        "filmSeconds": 11.75,
                        "caption": "返修原片 1.75 秒 / 新成片 11.75 秒：右手沿自由边下放，补布随封面移动。"
                      },
                      {
                        "image": "generated/book-repair-r2/evidence/closure-3_5s.jpg",
                        "sourceSeconds": 3.5,
                        "filmSeconds": 13.5,
                        "caption": "返修原片 3.50 秒 / 新成片 13.50 秒：同一封面落平，页块留在台面。"
                      }
                    ],
                    "before": {
                      "shotId": "book-3",
                      "actualMedia": {
                        "video": "https://github.com/yydshly/1021_codex_project/releases/download/melies-media-20261022/book-repair--book-3.mp4",
                        "poster": "generated/book-repair/book-3.jpg",
                        "duration": 5.056,
                        "width": 1902,
                        "height": 1092,
                        "frameRate": "24/1",
                        "hasAudio": true,
                        "byteSize": 3867307,
                        "videoCodec": "h264"
                      },
                      "logicReview": {
                        "assessment": "not_passed",
                        "label": "动作逻辑未通过",
                        "basis": "assistant_visual_recheck_after_user_feedback",
                        "userFeedback": "合书的方向不对。",
                        "expected": "先确定这本书的书脊和封面连接边；封面应围绕同一连接轴合拢，固定侧、书脊和页块不能在动作中换边或另生转轴。",
                        "observed": "左侧仍可见书脊结构，远侧板状封面 / 页片却竖起再落下，连接轴与移动方向关系不一致；约 1 秒后手部接触也不持续可读。",
                        "check": "对照展开、半合、合拢三帧，追踪同一书脊、封面连接边、自由边和补布；核对旋转轴、手施力方向与最终封面朝向能否连续解释。",
                        "evidenceFrames": [
                          {
                            "image": "generated/book-repair/evidence/closure-0_1s.jpg",
                            "sourceSeconds": 0.1,
                            "filmSeconds": 10.1,
                            "caption": "原片 0.10 秒 / 成片 10.10 秒：展开状态与可见书脊。"
                          },
                          {
                            "image": "generated/book-repair/evidence/closure-1s.jpg",
                            "sourceSeconds": 1,
                            "filmSeconds": 11,
                            "caption": "原片 1.00 秒 / 成片 11.00 秒：远侧板状封面 / 页片竖起。"
                          },
                          {
                            "image": "generated/book-repair/evidence/closure-2s.jpg",
                            "sourceSeconds": 2,
                            "filmSeconds": 12,
                            "caption": "原片 2.00 秒 / 成片 12.00 秒：落下后的书脊与封面关系。"
                          }
                        ]
                      }
                    },
                    "techniqueIds": [
                      "lighting-volumetric-light"
                    ],
                    "taskId": "1035123",
                    "actualInput": {
                      "en": "5 seconds, 16:9. Animate ONE gentle book closure between these first and last frames. At the start the front cover alone is slightly raised. The left LONG SPINE is the single fixed hinge: keep it and the back cover and the entire yellowed page block stationary on the wooden table. The right hand maintains gentle fingertip contact with the raised front cover's RIGHT FREE EDGE and slowly lowers that rigid cover about the LEFT LONG SPINE HINGE, through one continuous small arc, until it lies flat on the page block by about 3 seconds; hold for the remaining time. The left hand stays at the spine to steady the book. The small beige patch travels WITH THE SAME FRONT COVER and remains at its lower-right outer corner. Never pivot at a short edge, lift the page block, turn a paper leaf into a cover, flip the whole book, detach the hinge or add a second book. Keep geometry and hand contact continuously readable, no extra gesture. Preserve the same aged indigo cloth, patch, linen sleeves, tabletop, soft left window light and restrained colors. Fixed camera and focus, no cuts, zoom, orbit, exaggerated light beam, dust, magic, text or logos. Quiet workshop room tone and a subtle cloth-cover contact sound, no speech or music.",
                      "translationZh": "5 秒，16:9。在首尾帧之间只做一次轻柔合书。开始时只有前封面略微抬起。左侧长书脊是唯一固定转轴：它、后封面与整块泛黄书页都固定在木台上。右手指尖持续轻触抬起前封面的右侧自由边，绕左侧长书脊连接轴沿一条连续小圆弧缓慢放下这一块硬封面，约 3 秒时平放到页块上，余下时间停住。左手留在书脊处稳住书。小块米色补布随同一前封面移动，始终位于其外侧右下角。不得绕短边旋转、抬起页块、把纸页变成封面、翻转整本书、断开连接轴或增加第二本书。书体与手部接触全过程可读，不加额外手势。保留靛蓝旧布面、补布、亚麻袖口、台面、左侧柔和窗光和克制色彩。机位和焦点固定，不切镜、变焦、环绕、夸张光束、纸尘、魔法、文字或标志。只有安静工作室底噪和轻微布面合拢接触声，无人声和音乐。",
                      "submittedLanguage": "en",
                      "translationStatus": "corresponding_translation_not_submitted",
                      "requestedDuration": 5,
                      "referenceRole": "dedicated_first_and_last_frames_not_only_identity"
                    },
                    "actualMedia": {
                      "video": "https://github.com/yydshly/1021_codex_project/releases/download/melies-media-20261022/book-repair-r2--book-3-r2.mp4",
                      "poster": "generated/book-repair-r2/book-3-r2.jpg",
                      "duration": 5.056,
                      "width": 1902,
                      "height": 1092,
                      "frameRate": "24/1",
                      "videoCodec": "h264",
                      "hasAudio": true,
                      "byteSize": 4079382
                    },
                    "referenceFrames": [
                      {
                        "role": "firstFrame",
                        "image": "https://github.com/yydshly/1021_codex_project/releases/download/melies-media-20261022/book-repair-r2--reference--closure-first.png"
                      },
                      {
                        "role": "endFrame",
                        "image": "https://github.com/yydshly/1021_codex_project/releases/download/melies-media-20261022/book-repair-r2--reference--closure-last.png"
                      }
                    ],
                    "edit": {
                      "timelineShotId": "book-3",
                      "sourceShotId": "book-3-r2",
                      "source": "assets/generated/book-repair-r2/book-3-r2/video_20261022141518.mp4",
                      "sourceSha256": "c49c6c764313e80a6800db8f7ef12633dc2d733620aecb9f602445d74f58e92b",
                      "sourceStart": 0,
                      "duration": 4,
                      "timeline": {
                        "start": 10,
                        "end": 14
                      }
                    }
                  }
                ]
              }
            ],
            "shots": [
              {
                "shotId": "book-3",
                "intent": "从局部回到工作空间，给照料一个完成并停留的时刻。",
                "selectionReason": "用窗光和极少纸尘组织真实空间层次，让光服从合书动作。",
                "observedEffect": "原片 0.1 秒为展开状态，约 1 秒远侧封面 / 页片竖起，约 2 秒落下成为合书，之后停留；书脊、开合方向与封面归属没有保持可信关系，不能只按“从开到合”认定动作成立。",
                "problems": [
                  "可见书脊仍在左侧，但封面 / 页片从远侧竖起再落下，旋转轴与书脊的空间关系不一致，表现为开合方向和书体结构矛盾；不是单纯手部接触不够清楚。",
                  "约 1 秒双手已大部分离开，之后书页继续合拢，双手与书页的接触点没有持续清楚呈现。",
                  "自然窗光明显，但明确成束的体积光不突出，不能把普通窗光视为体积光规则已充分实现。"
                ],
                "nextAttempt": {
                  "status": "proposed_unverified",
                  "action": "优先修正书体结构与合书轴：先准备同一本书展开、半合、闭合三种一致状态的参考，确认连接边不变，再约束双手驱动和释放顺序；保持既有光线，不同时追求更强光束。",
                  "promptRole": "候选书体与开合轴约束，尚未生成验证；轴由具体书脊决定，不用固定画面左右代替物体坐标。",
                  "promptZh": "先沿参考明确同一本书的书脊、固定封面、移动封面及连接边。保持书脊和页块在台面上的位置与朝向不变，移动封面只绕该书脊连接轴合拢；其自由边沿同一圆弧回到页块上，不从另一条边另起转轴，不把整本书翻转。手持续接触并驱动该封面，合稳后再停住。保留原有柔和左侧窗光。",
                  "promptEn": "Use the reference to identify the single book spine, fixed cover, moving cover and connected edge. Keep the spine and page block fixed in position and orientation on the table. Close the moving cover only about that same spine hinge; its free edge follows one continuous arc onto the page block. Do not create a second hinge at another edge or flip the whole book. The hand remains in contact and drives the cover until it rests closed, then pauses. Retain the same soft window light from the left.",
                  "check": "先对照展开、半合、闭合三帧的同一书脊与连接边，核对轴、自由边路径及补布所在封面，再检查施力接触和停留。不能只看最终出现一本合上的书。"
                },
                "logicReview": {
                  "assessment": "not_passed",
                  "label": "动作逻辑未通过",
                  "basis": "assistant_visual_recheck_after_user_feedback",
                  "userFeedback": "合书的方向不对。",
                  "expected": "先确定这本书的书脊和封面连接边；封面应围绕同一连接轴合拢，固定侧、书脊和页块不能在动作中换边或另生转轴。",
                  "observed": "左侧仍可见书脊结构，远侧板状封面 / 页片却竖起再落下，连接轴与移动方向关系不一致；约 1 秒后手部接触也不持续可读。",
                  "check": "对照展开、半合、合拢三帧，追踪同一书脊、封面连接边、自由边和补布；核对旋转轴、手施力方向与最终封面朝向能否连续解释。",
                  "evidenceFrames": [
                    {
                      "image": "generated/book-repair/evidence/closure-0_1s.jpg",
                      "sourceSeconds": 0.1,
                      "filmSeconds": 10.1,
                      "caption": "原片 0.10 秒 / 成片 10.10 秒：展开状态与可见书脊。"
                    },
                    {
                      "image": "generated/book-repair/evidence/closure-1s.jpg",
                      "sourceSeconds": 1,
                      "filmSeconds": 11,
                      "caption": "原片 1.00 秒 / 成片 11.00 秒：远侧板状封面 / 页片竖起。"
                    },
                    {
                      "image": "generated/book-repair/evidence/closure-2s.jpg",
                      "sourceSeconds": 2,
                      "filmSeconds": 12,
                      "caption": "原片 2.00 秒 / 成片 12.00 秒：落下后的书脊与封面关系。"
                    }
                  ]
                }
              }
            ]
          }
        ]
      }
    ],
    "count": 7,
    "retrieval": "local_keyword_screening_with_manual_selection_not_model_inference",
    "integration": "copy_context_to_current_assistant_then_import_storyboard_json"
  },
  "example": {
    "schemaVersion": 1,
    "brief": {
      "goal": "为旧书修复工作室设计一支短片：修复并交还一本旧书，让读者感到被珍视的故事可以继续。",
      "subject": "一本靛蓝布面旧书、修复者的双手和等候取书的读者",
      "audience": "珍惜书籍、手工与旧物的人",
      "emotion": "从担心书页受损，到感受到细致照料，最后安心地接回旧书。",
      "setting": "晨间窗边的木质修复台；纸纤维、针脚、少量纸尘与自然光束。结尾预留片名空间。",
      "avoid": "魔法瞬间修复、纸张淋雨、森林倒影、奢侈品展台、强行圆形转场、无理由环绕、夸张粒子特效",
      "duration": 18,
      "aspectRatio": "16:9",
      "shotCount": 4,
      "assets": "无已有图片或视频参考；先用文字定义跨镜一致性。"
    },
    "title": {
      "zh": "让故事，继续",
      "en": "Let the Story Continue"
    },
    "concept": {
      "zh": "从磨损处看见时间，从一次针线动作看见照料，最后让旧书回到等待的双手。叙事由修复与交还推进。",
      "en": "See time in a worn spine, care in one stitch, and continuity as the book returns to waiting hands. Repair and return carry the story."
    },
    "constraints": {
      "zh": "保留旧物痕迹，动作克制且接触真实；不做魔法修复、纸张淋雨、森林倒影、奢侈品陈列、圆形转场、环绕或夸张粒子。",
      "en": "Retain signs of use, restrained actions and plausible contact. No magical repair, rain on paper, forest reflections, luxury-product staging, circular match cuts, orbiting camera or exaggerated particles."
    },
    "intention": {
      "emotionStart": "对脆弱旧书的担心",
      "turningEvent": "修复者用一个清楚、克制的动作照料损伤",
      "emotionEnd": "接回旧书的安心与延续感"
    },
    "anchor": {
      "zh": "同一本靛蓝布面旧书，封面右下角有一小块浅米色补布，尺寸与布纹跨镜一致。开场书脊磨损，末尾修补后仍保留使用痕迹。修复者穿亚麻袖衣，读者是灰色毛衣袖口；不拍脸。木质工作台、左侧晨光，平实低饱和色彩。",
      "en": "The same indigo clothbound old book has a small pale-beige repair patch on the lower-right cover corner; its size and cloth texture remain consistent. The opening spine is frayed; repaired areas still retain signs of use at the end. The restorer wears linen sleeves, the reader gray wool cuffs; faces stay outside frame. A wooden worktable, morning light from the left, restrained natural colors."
    },
    "selectedRuleIds": [
      "lenses-macro",
      "composition-negative-space",
      "lighting-volumetric-light"
    ],
    "rejectedRules": [
      {
        "id": "atmosphere-rain",
        "reason": "室内修复动作不需要天气推动；让纸张淋雨会破坏这次照料的主题。"
      },
      {
        "id": "editing-graphic-match",
        "reason": "通过同一本书和动作顺序衔接已经足够，没有必要添加圆形视觉母题。"
      },
      {
        "id": "camera-movement-arc-left",
        "reason": "保持机位有助于看清手与纸的接触，叙事不需要环绕揭示新空间。"
      },
      {
        "id": "composition-reflections",
        "reason": "布面与纸张是哑光材质；交还关系用真实动作表达，不另设镜面意象。"
      }
    ],
    "provenance": {
      "mode": "assistant_authored",
      "mediaStatus": "design_only",
      "modelVersion": null,
      "referenceCaseIds": [
        "rain-to-forest"
      ],
      "reusedLogic": "参考香水复盘中‘先约束接触与机位’‘单镜只保留一个主要动作’‘文案后期加入’的经验；不继承香水场景与验证状态。",
      "newDesign": "旧书修复与交还的事件、跨镜道具锚点、静态观察节奏和读者关系均为本次新设计。",
      "evidence": "依据现有文字复盘设计；本次未重新观看原片，未生成或评估旧书视频。"
    },
    "shots": [
      {
        "id": "book-1",
        "title": "磨损处",
        "duration": 4,
        "task": "先让观众注意到脆弱的材料，建立需要被照料的对象。",
        "ruleIds": [
          "lenses-macro"
        ],
        "reason": "微距让纸纤维与磨损可见；固定机位保留细小动作的可读性。",
        "scene": {
          "zh": "旧书平放在修复台上，书脊朝向镜头。一只手用柔软小刷沿磨损书脊轻轻刷过一次，露出纸纤维；不出现修复前后瞬间变化。",
          "en": "The old book rests on the repair table with its spine facing camera. One hand makes a single gentle pass with a soft small brush along the frayed spine, revealing paper fibers; no instant before-and-after transformation."
        },
        "camera": {
          "movement": "locked",
          "view": {
            "zh": "与书脊接近等高的斜侧微距，保留刷头与书脊接触处的景深。",
            "en": "Oblique side macro near spine level, with enough depth of field to read the brush-to-spine contact."
          }
        },
        "composition": {
          "zh": "书脊横向占画面中段，手从左侧进入；背景自然虚化。",
          "en": "The spine crosses the middle of frame; the hand enters from the left; the background falls gently out of focus."
        },
        "lighting": {
          "zh": "左侧窗户漫射晨光，纸纤维柔和可见，不做强烈光束。",
          "en": "Soft morning window light from the left reveals paper fibers without a pronounced beam."
        },
        "sound": {
          "zh": "轻微刷毛摩擦声与安静室内底噪，无旁白。",
          "en": "A faint brush sound over quiet room tone, no voice-over."
        },
        "details": {
          "focusTarget": {
            "zh": "磨损书脊上的纸纤维与刷头接触点；接触区清楚，远处逐渐失焦。",
            "en": "Paper fibers and the brush contact point on the frayed spine; keep the contact zone crisp with gradual falloff beyond it."
          }
        },
        "transitionOut": {
          "type": "cut"
        },
        "checks": [
          "纸纤维与手指比例稳定",
          "刷头接触真实且只刷一次",
          "机位保持斜侧，不自动变成俯拍"
        ]
      },
      {
        "id": "book-2",
        "title": "一针照料",
        "duration": 6,
        "task": "用一个可读的劳动动作，把担心转为被照料的感受。",
        "ruleIds": [
          "lenses-macro"
        ],
        "reason": "复用‘微距看清接触点’的规则，动作缩减为一根针完成一次穿孔，不把整个修复流程塞进一镜。",
        "scene": {
          "zh": "同一本书打开支撑在软垫上。修复者一手稳住书帖，另一手将带米色细线的针缓慢穿过一个已有装订孔，完成一次穿孔后停住。",
          "en": "The same book lies open on a soft support. One hand steadies the section while the other slowly passes a needle with fine beige thread through one existing binding hole, then pauses after this single pass."
        },
        "camera": {
          "movement": "locked",
          "view": {
            "zh": "装订孔一侧的近距离微距，略高于台面；两只手的接触点同时可读。",
            "en": "A close macro view from the binding-hole side, slightly above the table; the contact points of both hands remain readable."
          }
        },
        "composition": {
          "zh": "装订孔位于中间偏左，针线轨迹不被手掌遮住。",
          "en": "The binding hole sits slightly left of center and the palms do not obscure the needle path."
        },
        "lighting": {
          "zh": "延续左侧柔和窗光，线与纸有足够明暗分离。",
          "en": "Continue soft window light from the left, separating the thread clearly from the paper."
        },
        "sound": {
          "zh": "轻微穿线与纸张摩擦声，保留一次动作的停顿。",
          "en": "Subtle thread and paper friction, with a pause after the single movement."
        },
        "details": {
          "focusTarget": {
            "zh": "针尖、已有装订孔与线的接触区；线保持一根，手指和孔位不漂移。",
            "en": "The needle tip, existing binding hole and thread contact zone; one continuous thread, with stable fingers and hole position."
          }
        },
        "transitionOut": {
          "type": "cut"
        },
        "checks": [
          "针不能穿过实体手指",
          "不凭空增加针线或装订孔",
          "一次动作结束后停顿，不跳成瞬间修好"
        ]
      },
      {
        "id": "book-3",
        "title": "轻轻合上",
        "duration": 4,
        "task": "从局部回到人的工作空间，给细致照料一个安静的完成时刻。",
        "ruleIds": [
          "lighting-volumetric-light"
        ],
        "reason": "以窗光和极少纸尘交代真实空间与时间；光束辅助动作，不作为主角。",
        "scene": {
          "zh": "镜头来到修复台的中景。修复者双手轻轻合上修补过的同一本书，封面补布仍可见，书上保留自然旧痕，动作结束后短暂停留。",
          "en": "In a medium view of the repair table, the restorer gently closes the same repaired book with both hands. The cover patch remains visible, signs of age remain, and the hands pause briefly after closing it."
        },
        "camera": {
          "movement": "locked",
          "view": {
            "zh": "台面斜侧中景，看到手、旧书与左侧窗边的一小段空间。",
            "en": "An oblique medium view across the table, showing hands, book and a small portion of the window area on the left."
          }
        },
        "composition": {
          "zh": "书与双手是视觉中心，背景只保留少量日常工具。",
          "en": "The book and hands are the visual center; only a few ordinary tools remain in the background."
        },
        "lighting": {
          "zh": "晨光来自左侧可解释的窗户，整体柔和，书面不过曝。",
          "en": "Morning light comes from the plausible window on the left; keep the overall light soft and the cover correctly exposed."
        },
        "sound": {
          "zh": "布面轻合的声音，持续安静室内底噪。",
          "en": "The soft sound of the cloth cover closing over continuous quiet room tone."
        },
        "details": {
          "volumetric": {
            "zh": "左侧窗光斜向照入，空气中极少量纸尘使一束很淡的光可见；不漂浮魔法粒子，不遮住双手。",
            "en": "Window light enters diagonally from the left; a very small amount of airborne paper dust makes one faint shaft visible. No magical particles and no obscuring the hands."
          }
        },
        "transitionOut": {
          "type": "cut"
        },
        "checks": [
          "同一本书的封面与补布一致",
          "双手合书动作稳定",
          "纸尘极少且光向与窗户一致"
        ]
      },
      {
        "id": "book-4",
        "title": "回到手中",
        "duration": 4,
        "task": "让照料成为人与人的交付，留下故事继续的余韵。",
        "ruleIds": [
          "composition-negative-space"
        ],
        "reason": "交还动作在画面左侧完成，右侧留给后期片名；空白不承担产品陈列。",
        "scene": {
          "zh": "修复者将合上的旧书沿木台轻轻交给等待的读者。灰色毛衣袖口的双手接住书，双方短暂停住；不握手，不增加其他动作。",
          "en": "Across the wooden table, the restorer gently passes the closed book into the waiting reader's hands with gray wool cuffs. Both pairs of hands pause once the book is received; no handshake or extra action."
        },
        "camera": {
          "movement": "locked",
          "view": {
            "zh": "略高于台面的斜侧中近景，只见两人的前臂、手与书。",
            "en": "An oblique medium close view slightly above table level, showing only forearms, hands and book."
          }
        },
        "composition": {
          "zh": "交还动作位于左侧；右侧为柔和干净的墙面与桌面，没有工具、移动人影或耀眼光斑。",
          "en": "The handover takes place on the left; the right contains a calm clear wall and table area, without tools, moving figures or bright highlights."
        },
        "lighting": {
          "zh": "继续柔和左侧晨光，右侧文案区域明暗平稳。",
          "en": "Continue soft morning light from the left; keep even contrast in the right-side title area."
        },
        "sound": {
          "zh": "书与掌心接触的轻声，末尾室内底噪自然延续。",
          "en": "A soft book-to-palm contact sound, with room tone continuing at the end."
        },
        "details": {
          "negativeSpace": {
            "side": "right",
            "percent": 40,
            "subjectPlacement": {
              "zh": "书和两双手位于画面左侧，右侧约 40% 作为后期片名安全区。",
              "en": "The book and both pairs of hands stay on the left; reserve roughly 40% on the right as a title-safe area for post-production."
            }
          }
        },
        "transitionOut": {
          "type": "cut"
        },
        "checks": [
          "书在交接中不改变形状或消失",
          "两双手的袖口身份可辨",
          "后期加入片名‘让故事，继续’，实际量取安全区后验收"
        ]
      }
    ]
  },
  "bookExecution": {
    "id": "book-repair",
    "title": "让故事，继续",
    "recordedAt": "2026-10-22",
    "tags": [
      "旧书修复",
      "手工",
      "物品交还",
      "照料",
      "延续",
      "微距偏差",
      "手与道具接触",
      "对象重复",
      "体积光",
      "留白",
      "跨镜一致性",
      "首版复盘",
      "动作逻辑",
      "穿针位置",
      "合书方向",
      "开合轴"
    ],
    "goal": {
      "product": "虚构旧书修复工作室；一本靛蓝布面旧书，前封面右下角有小块浅米色补布。",
      "audience": "珍惜书籍、手工与旧物的人；为创作设定，未做受众测试。",
      "communicationGoal": "通过刷拭、穿针、合书与交还的事件，把旧物被细致照料、故事得以继续的关系表达出来。",
      "intendedEmotion": "担心旧书的脆弱 → 看到劳动与照料 → 安心接回旧书；属于意图，未验证观众是否如此感受。",
      "coreMessage": "让故事，继续。",
      "constraints": [
        "18 秒、16:9、4 镜",
        "同一旧书、左侧晨光与木台",
        "以亚麻袖口与灰色毛衣袖口区分修复者和读者，不拍脸",
        "每镜一个主要动作，摄影机固定",
        "微距、克制的窗光与浮尘、末镜右侧约 40% 留白",
        "无魔法瞬间修复、无森林雨景，片名后期加入"
      ],
      "successCriteria": [
        "书脊纤维与刷头接触能在微距中读清",
        "针线穿过既有装订孔，只有一本书，手与孔稳定",
        "合书时双手与封面的接触连贯，光束由真实窗光和少量散射介质支持",
        "交还动作与两人的袖口身份可读",
        "文字不遮动作，不能仅凭提示词宣称右侧留白比例达标"
      ]
    },
    "review": {
      "status": "one_run_qualitative_review",
      "sampleSize": 1,
      "summary": "四镜已生成并剪成 18 秒首版，旧书质感与交还关系可见；动作逻辑未通过复核：穿针作用位置与方案不符，疑似叠书；合书方向与可见书脊的开合轴关系不一致。这些是内容正确性问题，需优先于景别、体积光和留白的美化修正。原片保留，未重新生成。",
      "effectiveParts": [
        "四镜按刷拭、穿针、合书、交还排列；排列顺序可辨不等于动作内部或跨镜逻辑正确。",
        "靛蓝布面、浅米色补布与木台 / 左侧窗光提供了反复出现的视觉线索；不等于书的结构完全一致。",
        "末镜亚麻袖口与灰色毛衣袖口区分两人，约 2 秒后共同托书停留，交还关系可读。",
        "依据真实画面将片名放在右上墙面，没有遮住主要手部动作；文字由后期制作。"
      ],
      "evidenceBasis": "四段原始素材完整解码和尺寸 / 时长 / 帧率测量；查看 0.1 秒、逐秒和尾帧抽帧，并检查关键细节原尺寸帧；网页播放与成片检查。视觉结论为本次定性观察。",
      "limits": [
        "一套方案、一次执行；四个镜头不是四次独立复现实验，没有成功率或跨模型结论。",
        "单张合书身份参考与多镜沿用整本书构图同时出现，但未隔离参考模式、文字或模型因素，不能断言唯一原因。",
        "没有完成逐帧拓扑、光学或留白百分比的量测，不保证手、线、孔与反射等物理正确。",
        "音轨存在，已做技术解码与后期响度处理，但未进行听感、内容或声画同步验收，不能声称无音乐 / 无人声要求已全部实现。",
        "未做观众情绪、传播效果或真实修书工艺正确性验证；短片不是修复教学。",
        "候选构图图、首帧、接触点与留白改法均未再次生成，不可升级为已验证改进。"
      ],
      "logicPriority": "先验收物体结构、动作作用位置、转轴与动作前后状态，再评价叙事表达与镜头呈现。仅为人工审片原则，不是网页的自动物理校验。",
      "recheckNote": "用户指出穿针位置、合书方向问题后，重新查看原始时间抽帧。此前合书复盘只强调接触不连续，遗漏了开合轴；本次补记，不改写实际输入或原片。"
    },
    "shotReviews": [
      {
        "shotId": "book-1",
        "intent": "先通过材料的脆弱与一次轻刷，引起对旧书的注意。",
        "selectionReason": "微距原本用于读清纸纤维和刷头接触；固定机位避免细节被额外运动分散。",
        "outcome": "partially_met",
        "observedEffect": "靛蓝旧书、米色补布、亚麻袖口和左侧窗光可见；约 1–4.8 秒手持小刷在封面刷拭，旧物身份线索保留。",
        "problems": [
          "画面仍包含整本书和较多工作台，未达到书脊纸纤维的微距尺度。",
          "刷子主要扫向封面，包含多个短刷拭动作，没有严格沿磨损书脊轻刷一次。"
        ],
        "causeAssessment": "单张整本书参考的构图在结果中保留较强，但未做隔离实验，不能确定是参考模式、文字约束还是模型执行导致。",
        "nextAttempt": {
          "status": "proposed_unverified",
          "action": "另备只包含书脊接触区的专用构图参考，将身份图与镜头构图区分；先只测试景别与刷头落点。",
          "promptRole": "下一轮替换机位和动作范围的候选片段，未生成验证。",
          "promptZh": "使用专用书脊近距构图：画面只含一小段磨损书脊、纸纤维与刷头，不展示整本封面。刷头从书脊左端到右端轻扫一次后停住，不扫封面，不往返。保持接触点在焦内。",
          "promptEn": "Use a dedicated tight spine framing reference: show only a small frayed spine section, paper fibers and brush tip, not the entire cover. Make one gentle brush pass from the left end of this spine section to the right and stop. Do not brush the cover or move back and forth. Keep the contact point in focus.",
          "check": "先核对景别是否真正排除整本书，再比较刷头路径、接触点与动作次数；不能以整体质感好代替微距达标。"
        },
        "title": "磨损处",
        "targetEffect": "旧书平放在修复台上，书脊朝向镜头。一只手用柔软小刷沿磨损书脊轻轻刷过一次，露出纸纤维；不出现修复前后瞬间变化。",
        "techniqueIds": [
          "lenses-macro"
        ],
        "taskId": "1035062",
        "designPrompt": {
          "zh": "目标剪辑时长 4 秒，画幅 16:9。单个连续镜头。\n同一本靛蓝布面旧书，封面右下角有一小块浅米色补布，尺寸与布纹跨镜一致。开场书脊磨损，末尾修补后仍保留使用痕迹。修复者穿亚麻袖衣，读者是灰色毛衣袖口；不拍脸。木质工作台、左侧晨光，平实低饱和色彩。\n旧书平放在修复台上，书脊朝向镜头。一只手用柔软小刷沿磨损书脊轻轻刷过一次，露出纸纤维；不出现修复前后瞬间变化。\n与书脊接近等高的斜侧微距，保留刷头与书脊接触处的景深。\n摄影机保持固定。\n书脊横向占画面中段，手从左侧进入；背景自然虚化。\n左侧窗户漫射晨光，纸纤维柔和可见，不做强烈光束。\n磨损书脊上的纸纤维与刷头接触点；接触区清楚，远处逐渐失焦。\n声音设计：轻微刷毛摩擦声与安静室内底噪，无旁白。\n保留旧物痕迹，动作克制且接触真实；不做魔法修复、纸张淋雨、森林倒影、奢侈品陈列、圆形转场、环绕或夸张粒子。\n不生成叠加字幕、片名或标志；片名后期制作。音轨和时长按目标工具能力另行设置。",
          "en": "Target edit duration 4 seconds, aspect ratio 16:9. One continuous shot.\nThe same indigo clothbound old book has a small pale-beige repair patch on the lower-right cover corner; its size and cloth texture remain consistent. The opening spine is frayed; repaired areas still retain signs of use at the end. The restorer wears linen sleeves, the reader gray wool cuffs; faces stay outside frame. A wooden worktable, morning light from the left, restrained natural colors.\nThe old book rests on the repair table with its spine facing camera. One hand makes a single gentle pass with a soft small brush along the frayed spine, revealing paper fibers; no instant before-and-after transformation.\nOblique side macro near spine level, with enough depth of field to read the brush-to-spine contact.\nKeep the camera locked off.\nThe spine crosses the middle of frame; the hand enters from the left; the background falls gently out of focus.\nSoft morning window light from the left reveals paper fibers without a pronounced beam.\nPaper fibers and the brush contact point on the frayed spine; keep the contact zone crisp with gradual falloff beyond it.\nSound design: A faint brush sound over quiet room tone, no voice-over.\nRetain signs of use, restrained actions and plausible contact. No magical repair, rain on paper, forest reflections, luxury-product staging, circular match cuts, orbiting camera or exaggerated particles.\nNo overlaid captions, titles or logos; add titles in post-production. Set audio and duration separately according to the target tool.",
          "role": "full_prompt_compiled_from_original_design_fields",
          "recordFile": "studio-book-repair.json"
        },
        "actualInput": {
          "submittedLanguage": "en",
          "en": "5 seconds, 16:9. Oblique side macro near spine level. The book starts closed and lying flat, frayed spine toward camera. A hand in a plain linen sleeve gently makes ONE slow pass with a small soft brush across the worn spine, then pauses. Show realistic fine paper fibers; keep the brush-to-spine contact zone crisp with enough depth of field, background softly out of focus. The hand enters from the left. The spine crosses the middle of frame. No sudden repair or change of material. Soft diffuse window light, no pronounced light shaft. The same small old indigo clothbound book, a small pale-beige rectangular repair patch at the lower-right corner of the front cover, naturally yellowed paper and signs of use. The reference image defines book identity and workshop materials, not mandatory framing or closed-book pose. An ordinary wooden repair table, soft morning light from a window on the left, restrained natural colors. No faces, no speech, no music, no overlaid text or logos. Quiet workshop room tone and subtle contact sounds only. No rain, mirrors, forest imagery, magical transformation or exaggerated particles. Keep the camera locked off: no zoom, pan, orbit or cuts within the clip. Plausible hands, rigid book geometry and continuous physical contact.",
          "translationZh": "5 秒，16:9。接近书脊高度的斜侧微距。开场旧书合上平放，磨损书脊朝镜头。穿素色亚麻袖衣的手用小软刷缓慢轻刷书脊一次，然后停住。纸纤维真实细小，刷头与书脊接触区清楚，景深足以看清接触，背景柔和虚化。手从左侧进入，书脊横向穿过画面中段。不要突然修好或改变材料。柔和漫射窗光，不做明显光束。同一本小型靛蓝布面旧书，前封面右下角有小块浅米色矩形补布，纸边自然泛黄并保留旧痕。参考图只规定书的身份与工作台材质，不强制沿用构图或合书姿态。普通木质修复台，左侧窗户柔和晨光，色彩自然克制。不拍脸，无人声、音乐、叠加文字或标志；只有安静工作室底噪和轻微接触声。不要雨、镜面、森林意象、魔法变化或夸张粒子。摄影机固定：镜内不变焦、摇移、环绕或切镜。手部合理，书的几何稳定，接触连续。",
          "translationStatus": "corresponding_translation_not_submitted",
          "requestedDuration": 5,
          "type": "i2v",
          "referenceRole": "book_identity_and_workshop_materials_not_first_frame"
        },
        "actualMedia": {
          "video": "https://github.com/yydshly/1021_codex_project/releases/download/melies-media-20261022/book-repair--book-1.mp4",
          "poster": "generated/book-repair/book-1.jpg",
          "duration": 5.056,
          "width": 1902,
          "height": 1092,
          "frameRate": "24/1",
          "videoCodec": "h264",
          "hasAudio": true,
          "byteSize": 4403311
        },
        "edit": {
          "sourceStart": 0.5,
          "duration": 4,
          "timeline": {
            "start": 0,
            "end": 4
          }
        }
      },
      {
        "shotId": "book-2",
        "intent": "用一次针线劳动，让照料成为可见动作，而非瞬间修复。",
        "selectionReason": "微距应读清针尖、线与已有装订孔的接触；将动作缩为一次穿孔，避免塞入完整修书流程。",
        "outcome": "partially_met",
        "observedEffect": "约 0–4 秒针靠近并下移到纸页上的点位，约 5–9 秒手提针线；亚麻袖口、旧纸和工作台可见，动作集中在一次下移与提线。",
        "problems": [
          "打开的书页与独立书壳看起来叠在一册合上的靛蓝旧书上，出现重复对象 / 结构不一致，不能确认是同一本书的正常打开状态。",
          "本方案要求针穿书脊既有装订孔，实际针尖却落在打开页片偏外侧的点位，与目标作用位置不符；不能以出现针线和上下动作就判为装订成立。",
          "画面仍含完整手和较大书体，没有达到针尖—孔—线的极近微距尺度。"
        ],
        "causeAssessment": "原身份图是合书状态，文字要求改成开书和穿针；本次输出同时保留合书身份并添加开书结构。这是可见偏差与可能相关的输入条件，不是已证实原因。",
        "nextAttempt": {
          "status": "proposed_unverified",
          "action": "先画清单一书体与书脊装订孔的位置关系，准备孔位可辨的起始参考；只测试同一孔上的一次穿针，先验收作用位置和书体结构，再考虑微距效果。",
          "promptRole": "候选对象数量、起始状态与接触约束，必须配合新的真实输入参考，不当作本轮历史输入。",
          "promptZh": "画面中只有一本书，其已打开的书帖位于软书托上，下面没有合上的第二本书或额外书壳。近距构图显示书脊处一个已存在的装订孔，针尖在孔的入口外，单根线与针相连。只完成从该入口穿过到另一侧的一个动作；孔、纸与手的相对位置保持稳定。",
          "promptEn": "Show exactly one book, its open section supported on a soft cradle, with no second closed book or extra cover underneath. A tight view shows one existing binding hole at the spine. The needle tip begins just outside its entrance, attached to one continuous thread. Perform only one pass through that entrance to the other side, keeping hole, paper and hand positions stable.",
          "check": "先核对书体数量、书脊、目标孔与针的相对位置；再逐帧核对入口、出口和线的连续性。这里检验本方案的空间关系，不把候选描述当作专业修复工艺证明。"
        },
        "logicReview": {
          "assessment": "not_passed",
          "label": "动作逻辑未通过",
          "basis": "assistant_visual_recheck_after_user_feedback",
          "userFeedback": "穿针的位置不对。",
          "expected": "按本方案预设，针应作用于同一本书书脊处既有装订孔；入口、出口与线的走向要能对应。不是泛化断言所有书籍装订都使用同一工艺。",
          "observed": "针尖落在页片上的点位，打开的页块与下方合书形成疑似叠书结构，目标修复部位和书体关系没有成立。",
          "check": "先确认只有一个书体、书脊和目标孔，再检查针入口—出口—线是否围绕同一孔连续，最后检查动作是否真的改变目标部位。",
          "evidenceFrames": [
            {
              "image": "generated/book-repair/evidence/needle-4s.jpg",
              "sourceSeconds": 4,
              "filmSeconds": 7.5,
              "caption": "原片 4.00 秒 / 成片 7.50 秒：针落点与疑似叠书结构。"
            }
          ]
        },
        "title": "一针照料",
        "targetEffect": "同一本书打开支撑在软垫上。修复者一手稳住书帖，另一手将带米色细线的针缓慢穿过一个已有装订孔，完成一次穿孔后停住。",
        "techniqueIds": [
          "lenses-macro"
        ],
        "taskId": "1035065",
        "designPrompt": {
          "zh": "目标剪辑时长 6 秒，画幅 16:9。单个连续镜头。\n同一本靛蓝布面旧书，封面右下角有一小块浅米色补布，尺寸与布纹跨镜一致。开场书脊磨损，末尾修补后仍保留使用痕迹。修复者穿亚麻袖衣，读者是灰色毛衣袖口；不拍脸。木质工作台、左侧晨光，平实低饱和色彩。\n同一本书打开支撑在软垫上。修复者一手稳住书帖，另一手将带米色细线的针缓慢穿过一个已有装订孔，完成一次穿孔后停住。\n装订孔一侧的近距离微距，略高于台面；两只手的接触点同时可读。\n摄影机保持固定。\n装订孔位于中间偏左，针线轨迹不被手掌遮住。\n延续左侧柔和窗光，线与纸有足够明暗分离。\n针尖、已有装订孔与线的接触区；线保持一根，手指和孔位不漂移。\n声音设计：轻微穿线与纸张摩擦声，保留一次动作的停顿。\n保留旧物痕迹，动作克制且接触真实；不做魔法修复、纸张淋雨、森林倒影、奢侈品陈列、圆形转场、环绕或夸张粒子。\n不生成叠加字幕、片名或标志；片名后期制作。音轨和时长按目标工具能力另行设置。",
          "en": "Target edit duration 6 seconds, aspect ratio 16:9. One continuous shot.\nThe same indigo clothbound old book has a small pale-beige repair patch on the lower-right cover corner; its size and cloth texture remain consistent. The opening spine is frayed; repaired areas still retain signs of use at the end. The restorer wears linen sleeves, the reader gray wool cuffs; faces stay outside frame. A wooden worktable, morning light from the left, restrained natural colors.\nThe same book lies open on a soft support. One hand steadies the section while the other slowly passes a needle with fine beige thread through one existing binding hole, then pauses after this single pass.\nA close macro view from the binding-hole side, slightly above the table; the contact points of both hands remain readable.\nKeep the camera locked off.\nThe binding hole sits slightly left of center and the palms do not obscure the needle path.\nContinue soft window light from the left, separating the thread clearly from the paper.\nThe needle tip, existing binding hole and thread contact zone; one continuous thread, with stable fingers and hole position.\nSound design: Subtle thread and paper friction, with a pause after the single movement.\nRetain signs of use, restrained actions and plausible contact. No magical repair, rain on paper, forest reflections, luxury-product staging, circular match cuts, orbiting camera or exaggerated particles.\nNo overlaid captions, titles or logos; add titles in post-production. Set audio and duration separately according to the target tool.",
          "role": "full_prompt_compiled_from_original_design_fields",
          "recordFile": "studio-book-repair.json"
        },
        "actualInput": {
          "submittedLanguage": "en",
          "en": "10 seconds, 16:9. Start ALREADY OPEN on a soft linen book support, not opening from the closed reference pose. Close macro from the binding-hole side, slightly above the table. One linen-sleeved hand steadies the paper section while the other holds one needle carrying one fine beige thread. At first pause briefly; during the first six seconds slowly pass that single needle ONCE through one EXISTING visible binding hole, then hold still for the rest of the clip. Keep needle tip, hole and thread contact readable together, with the palms outside the contact area. The needle enters the paper hole, never a finger; the thread remains continuous, the hole and fingers remain stable. No repeated stitching, montage, instant restoration or whole-book repair sequence. Soft window light from the left separates thread from paper. The same small old indigo clothbound book, a small pale-beige rectangular repair patch at the lower-right corner of the front cover, naturally yellowed paper and signs of use. The reference image defines book identity and workshop materials, not mandatory framing or closed-book pose. An ordinary wooden repair table, soft morning light from a window on the left, restrained natural colors. No faces, no speech, no music, no overlaid text or logos. Quiet workshop room tone and subtle contact sounds only. No rain, mirrors, forest imagery, magical transformation or exaggerated particles. Keep the camera locked off: no zoom, pan, orbit or cuts within the clip. Plausible hands, rigid book geometry and continuous physical contact.",
          "translationZh": "10 秒，16:9。开场书已打开，支在柔软亚麻书托上，不要从参考图的合书姿态开始开书。装订孔一侧、略高于台面的近距离微距。一只亚麻袖口的手稳住书帖，另一只手拿一根穿着单根米色细线的针。先短暂停顿，在前六秒内缓慢将这一根针穿过一个已有且可见的装订孔一次，然后在余下时间保持停顿。针尖、孔与线的接触区同时可读，手掌不遮住接触。针只穿纸孔、不穿手指；线连续，孔和手指稳定。不重复穿针，不蒙太奇，不瞬间修复，不演整个修书流程。左侧柔和窗光使线与纸分离。同一本小型靛蓝布面旧书，前封面右下角有小块浅米色矩形补布，纸边自然泛黄并保留旧痕。参考图只规定书的身份与工作台材质，不强制沿用构图或合书姿态。普通木质修复台，左侧窗户柔和晨光，色彩自然克制。不拍脸，无人声、音乐、叠加文字或标志；只有安静工作室底噪和轻微接触声。不要雨、镜面、森林意象、魔法变化或夸张粒子。摄影机固定：镜内不变焦、摇移、环绕或切镜。手部合理，书的几何稳定，接触连续。",
          "translationStatus": "corresponding_translation_not_submitted",
          "requestedDuration": 10,
          "type": "i2v",
          "referenceRole": "book_identity_and_workshop_materials_not_first_frame"
        },
        "actualMedia": {
          "video": "https://github.com/yydshly/1021_codex_project/releases/download/melies-media-20261022/book-repair--book-2.mp4",
          "poster": "generated/book-repair/book-2.jpg",
          "duration": 10.048,
          "width": 1902,
          "height": 1092,
          "frameRate": "24/1",
          "videoCodec": "h264",
          "hasAudio": true,
          "byteSize": 6441698
        },
        "edit": {
          "sourceStart": 0.5,
          "duration": 6,
          "timeline": {
            "start": 4,
            "end": 10
          }
        }
      },
      {
        "shotId": "book-3",
        "intent": "从局部回到工作空间，给照料一个完成并停留的时刻。",
        "selectionReason": "用窗光和极少纸尘组织真实空间层次，让光服从合书动作。",
        "outcome": "partially_met",
        "observedEffect": "原片 0.1 秒为展开状态，约 1 秒远侧封面 / 页片竖起，约 2 秒落下成为合书，之后停留；书脊、开合方向与封面归属没有保持可信关系，不能只按“从开到合”认定动作成立。",
        "problems": [
          "可见书脊仍在左侧，但封面 / 页片从远侧竖起再落下，旋转轴与书脊的空间关系不一致，表现为开合方向和书体结构矛盾；不是单纯手部接触不够清楚。",
          "约 1 秒双手已大部分离开，之后书页继续合拢，双手与书页的接触点没有持续清楚呈现。",
          "自然窗光明显，但明确成束的体积光不突出，不能把普通窗光视为体积光规则已充分实现。"
        ],
        "causeAssessment": "此前审片遗漏了开合轴，只描述手离开与继续合拢；本次依据可见书脊和前后帧补记空间逻辑矛盾。具体生成原因仍未做隔离验证。",
        "nextAttempt": {
          "status": "proposed_unverified",
          "action": "优先修正书体结构与合书轴：先准备同一本书展开、半合、闭合三种一致状态的参考，确认连接边不变，再约束双手驱动和释放顺序；保持既有光线，不同时追求更强光束。",
          "promptRole": "候选书体与开合轴约束，尚未生成验证；轴由具体书脊决定，不用固定画面左右代替物体坐标。",
          "promptZh": "先沿参考明确同一本书的书脊、固定封面、移动封面及连接边。保持书脊和页块在台面上的位置与朝向不变，移动封面只绕该书脊连接轴合拢；其自由边沿同一圆弧回到页块上，不从另一条边另起转轴，不把整本书翻转。手持续接触并驱动该封面，合稳后再停住。保留原有柔和左侧窗光。",
          "promptEn": "Use the reference to identify the single book spine, fixed cover, moving cover and connected edge. Keep the spine and page block fixed in position and orientation on the table. Close the moving cover only about that same spine hinge; its free edge follows one continuous arc onto the page block. Do not create a second hinge at another edge or flip the whole book. The hand remains in contact and drives the cover until it rests closed, then pauses. Retain the same soft window light from the left.",
          "check": "先对照展开、半合、闭合三帧的同一书脊与连接边，核对轴、自由边路径及补布所在封面，再检查施力接触和停留。不能只看最终出现一本合上的书。"
        },
        "logicReview": {
          "assessment": "not_passed",
          "label": "动作逻辑未通过",
          "basis": "assistant_visual_recheck_after_user_feedback",
          "userFeedback": "合书的方向不对。",
          "expected": "先确定这本书的书脊和封面连接边；封面应围绕同一连接轴合拢，固定侧、书脊和页块不能在动作中换边或另生转轴。",
          "observed": "左侧仍可见书脊结构，远侧板状封面 / 页片却竖起再落下，连接轴与移动方向关系不一致；约 1 秒后手部接触也不持续可读。",
          "check": "对照展开、半合、合拢三帧，追踪同一书脊、封面连接边、自由边和补布；核对旋转轴、手施力方向与最终封面朝向能否连续解释。",
          "evidenceFrames": [
            {
              "image": "generated/book-repair/evidence/closure-0_1s.jpg",
              "sourceSeconds": 0.1,
              "filmSeconds": 10.1,
              "caption": "原片 0.10 秒 / 成片 10.10 秒：展开状态与可见书脊。"
            },
            {
              "image": "generated/book-repair/evidence/closure-1s.jpg",
              "sourceSeconds": 1,
              "filmSeconds": 11,
              "caption": "原片 1.00 秒 / 成片 11.00 秒：远侧板状封面 / 页片竖起。"
            },
            {
              "image": "generated/book-repair/evidence/closure-2s.jpg",
              "sourceSeconds": 2,
              "filmSeconds": 12,
              "caption": "原片 2.00 秒 / 成片 12.00 秒：落下后的书脊与封面关系。"
            }
          ]
        },
        "title": "轻轻合上",
        "targetEffect": "镜头来到修复台的中景。修复者双手轻轻合上修补过的同一本书，封面补布仍可见，书上保留自然旧痕，动作结束后短暂停留。",
        "techniqueIds": [
          "lighting-volumetric-light"
        ],
        "taskId": "1035064",
        "designPrompt": {
          "zh": "目标剪辑时长 4 秒，画幅 16:9。单个连续镜头。\n同一本靛蓝布面旧书，封面右下角有一小块浅米色补布，尺寸与布纹跨镜一致。开场书脊磨损，末尾修补后仍保留使用痕迹。修复者穿亚麻袖衣，读者是灰色毛衣袖口；不拍脸。木质工作台、左侧晨光，平实低饱和色彩。\n镜头来到修复台的中景。修复者双手轻轻合上修补过的同一本书，封面补布仍可见，书上保留自然旧痕，动作结束后短暂停留。\n台面斜侧中景，看到手、旧书与左侧窗边的一小段空间。\n摄影机保持固定。\n书与双手是视觉中心，背景只保留少量日常工具。\n晨光来自左侧可解释的窗户，整体柔和，书面不过曝。\n左侧窗光斜向照入，空气中极少量纸尘使一束很淡的光可见；不漂浮魔法粒子，不遮住双手。\n声音设计：布面轻合的声音，持续安静室内底噪。\n保留旧物痕迹，动作克制且接触真实；不做魔法修复、纸张淋雨、森林倒影、奢侈品陈列、圆形转场、环绕或夸张粒子。\n不生成叠加字幕、片名或标志；片名后期制作。音轨和时长按目标工具能力另行设置。",
          "en": "Target edit duration 4 seconds, aspect ratio 16:9. One continuous shot.\nThe same indigo clothbound old book has a small pale-beige repair patch on the lower-right cover corner; its size and cloth texture remain consistent. The opening spine is frayed; repaired areas still retain signs of use at the end. The restorer wears linen sleeves, the reader gray wool cuffs; faces stay outside frame. A wooden worktable, morning light from the left, restrained natural colors.\nIn a medium view of the repair table, the restorer gently closes the same repaired book with both hands. The cover patch remains visible, signs of age remain, and the hands pause briefly after closing it.\nAn oblique medium view across the table, showing hands, book and a small portion of the window area on the left.\nKeep the camera locked off.\nThe book and hands are the visual center; only a few ordinary tools remain in the background.\nMorning light comes from the plausible window on the left; keep the overall light soft and the cover correctly exposed.\nWindow light enters diagonally from the left; a very small amount of airborne paper dust makes one faint shaft visible. No magical particles and no obscuring the hands.\nSound design: The soft sound of the cloth cover closing over continuous quiet room tone.\nRetain signs of use, restrained actions and plausible contact. No magical repair, rain on paper, forest reflections, luxury-product staging, circular match cuts, orbiting camera or exaggerated particles.\nNo overlaid captions, titles or logos; add titles in post-production. Set audio and duration separately according to the target tool.",
          "role": "full_prompt_compiled_from_original_design_fields",
          "recordFile": "studio-book-repair.json"
        },
        "actualInput": {
          "submittedLanguage": "en",
          "en": "5 seconds, 16:9. Start with the same repaired book ALREADY OPEN on the table. A locked oblique medium view shows the book, linen-sleeved restorer forearms and a small portion of the left window area. Both hands gently close the book ONCE; after it closes they pause. The front cover and its lower-right beige patch become visible. Keep the book aged, not newly manufactured. Book and hands are the visual center, only a few ordinary tools far behind them. A faint diagonal shaft of morning window light from the left is made visible by VERY LITTLE airborne paper dust, consistent with the real window. No thick fog, glitter, smoke or particles obscuring the hands; cover correctly exposed. The same small old indigo clothbound book, a small pale-beige rectangular repair patch at the lower-right corner of the front cover, naturally yellowed paper and signs of use. The reference image defines book identity and workshop materials, not mandatory framing or closed-book pose. An ordinary wooden repair table, soft morning light from a window on the left, restrained natural colors. No faces, no speech, no music, no overlaid text or logos. Quiet workshop room tone and subtle contact sounds only. No rain, mirrors, forest imagery, magical transformation or exaggerated particles. Keep the camera locked off: no zoom, pan, orbit or cuts within the clip. Plausible hands, rigid book geometry and continuous physical contact.",
          "translationZh": "5 秒，16:9。开场同一本修补过的旧书已经打开在台面上。固定的斜侧中景看到书、亚麻袖衣修复者的前臂和左侧窗边少量空间。双手轻轻合书一次，合上后停住；前封面和其右下角米色补布变得可见。保留旧痕，不要变成新书。书与双手是视觉中心，远后方只有少量普通工具。左侧晨间窗光斜向照入，由极少空气纸尘使很淡的光束可见，光向与实际窗户一致。没有浓雾、闪粉、烟和遮手粒子，书面曝光正常。同一本小型靛蓝布面旧书，前封面右下角有小块浅米色矩形补布，纸边自然泛黄并保留旧痕。参考图只规定书的身份与工作台材质，不强制沿用构图或合书姿态。普通木质修复台，左侧窗户柔和晨光，色彩自然克制。不拍脸，无人声、音乐、叠加文字或标志；只有安静工作室底噪和轻微接触声。不要雨、镜面、森林意象、魔法变化或夸张粒子。摄影机固定：镜内不变焦、摇移、环绕或切镜。手部合理，书的几何稳定，接触连续。",
          "translationStatus": "corresponding_translation_not_submitted",
          "requestedDuration": 5,
          "type": "i2v",
          "referenceRole": "book_identity_and_workshop_materials_not_first_frame"
        },
        "actualMedia": {
          "video": "https://github.com/yydshly/1021_codex_project/releases/download/melies-media-20261022/book-repair--book-3.mp4",
          "poster": "generated/book-repair/book-3.jpg",
          "duration": 5.056,
          "width": 1902,
          "height": 1092,
          "frameRate": "24/1",
          "hasAudio": true,
          "byteSize": 3867307,
          "videoCodec": "h264"
        },
        "edit": {
          "sourceStart": 0,
          "duration": 4,
          "timeline": {
            "start": 10,
            "end": 14
          }
        }
      },
      {
        "shotId": "book-4",
        "intent": "把修复完成转为人与人的交还，让故事继续的关系可见。",
        "selectionReason": "原设计把交还放在左侧，并用右侧约 40% 留白给后期片名；不依赖生成文字。",
        "outcome": "partially_met",
        "observedEffect": "约 0.1–2 秒旧书从亚麻袖衣修复者移动到灰色毛衣袖口读者双手之间，约 2 秒后双方共同托书停留，两人的袖口身份和交还动作可读。",
        "problems": [
          "手臂和交还动作占据画面中央及右侧，未形成要求的右侧约 40% 全高干净区域。",
          "片名移到实际空出的右上墙面；这属于后期适配，不证明模型实现了指定留白比例。"
        ],
        "causeAssessment": "共同托书与自然接书路径保留，但文字指定的区域没有约束全部运动范围。未做动作路径 / 构图参考对照，不能确定仅增加比例描述就能解决。",
        "nextAttempt": {
          "status": "proposed_unverified",
          "action": "生成前先设计两人从画面左侧完成交接的构图，验证整段手臂运动都不进入右侧文案框；保留可读的袖口区分和共同托书停留。",
          "promptRole": "新的布局与运动范围候选，未重新生成。",
          "promptZh": "先用明确构图参考限定：书和两人的全部前臂、手掌，在整个交还过程中都保持于画面左侧六成区域；读者也从左侧或左后方接书。右侧四成文案区域在动作开始、接触和停留时都保持清空。保留亚麻袖口与灰色毛衣袖口，不生成片名。",
          "promptEn": "Use an explicit framing reference: throughout the handover, keep the book and both people's entire forearms and hands within the left sixty percent of frame; the reader receives it from the left or rear-left. Keep the right forty percent title area clear at the start, contact and final pause. Retain linen sleeves and gray wool cuffs; generate no title.",
          "check": "检查整段运动的范围，而非只看某个静止帧；叠加实际片名框后查看侵入和对比度，量取后再声称百分比达标。"
        },
        "title": "回到手中",
        "targetEffect": "修复者将合上的旧书沿木台轻轻交给等待的读者。灰色毛衣袖口的双手接住书，双方短暂停住；不握手，不增加其他动作。",
        "techniqueIds": [
          "composition-negative-space"
        ],
        "taskId": "1035063",
        "designPrompt": {
          "zh": "目标剪辑时长 4 秒，画幅 16:9。单个连续镜头。\n同一本靛蓝布面旧书，封面右下角有一小块浅米色补布，尺寸与布纹跨镜一致。开场书脊磨损，末尾修补后仍保留使用痕迹。修复者穿亚麻袖衣，读者是灰色毛衣袖口；不拍脸。木质工作台、左侧晨光，平实低饱和色彩。\n修复者将合上的旧书沿木台轻轻交给等待的读者。灰色毛衣袖口的双手接住书，双方短暂停住；不握手，不增加其他动作。\n略高于台面的斜侧中近景，只见两人的前臂、手与书。\n摄影机保持固定。\n交还动作位于左侧；右侧为柔和干净的墙面与桌面，没有工具、移动人影或耀眼光斑。\n继续柔和左侧晨光，右侧文案区域明暗平稳。\n书和两双手位于画面左侧，右侧约 40% 作为后期片名安全区。\n在右侧保留约 40% 空白，比例为待量取的设计目标。\n声音设计：书与掌心接触的轻声，末尾室内底噪自然延续。\n保留旧物痕迹，动作克制且接触真实；不做魔法修复、纸张淋雨、森林倒影、奢侈品陈列、圆形转场、环绕或夸张粒子。\n不生成叠加字幕、片名或标志；片名后期制作。音轨和时长按目标工具能力另行设置。",
          "en": "Target edit duration 4 seconds, aspect ratio 16:9. One continuous shot.\nThe same indigo clothbound old book has a small pale-beige repair patch on the lower-right cover corner; its size and cloth texture remain consistent. The opening spine is frayed; repaired areas still retain signs of use at the end. The restorer wears linen sleeves, the reader gray wool cuffs; faces stay outside frame. A wooden worktable, morning light from the left, restrained natural colors.\nAcross the wooden table, the restorer gently passes the closed book into the waiting reader's hands with gray wool cuffs. Both pairs of hands pause once the book is received; no handshake or extra action.\nAn oblique medium close view slightly above table level, showing only forearms, hands and book.\nKeep the camera locked off.\nThe handover takes place on the left; the right contains a calm clear wall and table area, without tools, moving figures or bright highlights.\nContinue soft morning light from the left; keep even contrast in the right-side title area.\nThe book and both pairs of hands stay on the left; reserve roughly 40% on the right as a title-safe area for post-production.\nReserve roughly 40% negative space on the right; measure the result rather than assuming exact compliance.\nSound design: A soft book-to-palm contact sound, with room tone continuing at the end.\nRetain signs of use, restrained actions and plausible contact. No magical repair, rain on paper, forest reflections, luxury-product staging, circular match cuts, orbiting camera or exaggerated particles.\nNo overlaid captions, titles or logos; add titles in post-production. Set audio and duration separately according to the target tool.",
          "role": "full_prompt_compiled_from_original_design_fields",
          "recordFile": "studio-book-repair.json"
        },
        "actualInput": {
          "submittedLanguage": "en",
          "en": "5 seconds, 16:9. The same book starts closed. Locked oblique medium-close view slightly above the wooden table, faces outside frame. The restorer with plain linen sleeves gently passes the book across the table into the waiting reader hands with gray wool cuffs; the reader receives it and BOTH people pause, hands still supporting it. One handover only; no handshake, re-opening or extra gesture. Keep the book and all four hands within the LEFT sixty percent of frame. Reserve roughly the RIGHT forty percent as calm clear pale wall and tabletop for a later Chinese title; no tools, moving figures or bright highlights there. Soft light continues from the left window, gentle even contrast in the title area. The cover patch stays in its original place. The same small old indigo clothbound book, a small pale-beige rectangular repair patch at the lower-right corner of the front cover, naturally yellowed paper and signs of use. The reference image defines book identity and workshop materials, not mandatory framing or closed-book pose. An ordinary wooden repair table, soft morning light from a window on the left, restrained natural colors. No faces, no speech, no music, no overlaid text or logos. Quiet workshop room tone and subtle contact sounds only. No rain, mirrors, forest imagery, magical transformation or exaggerated particles. Keep the camera locked off: no zoom, pan, orbit or cuts within the clip. Plausible hands, rigid book geometry and continuous physical contact.",
          "translationZh": "5 秒，16:9。同一本书开场合上。略高于木台面的固定斜侧中近景，脸在画外。穿素色亚麻袖衣的修复者沿台面轻轻把书交给灰色毛衣袖口读者等待的双手；读者接住后，双方停住，双手仍托住书。只交还一次，不握手、不重新开书、不增加手势。书和四只手都在画面左侧约六成区域。右侧约四成留作平静干净的浅墙与桌面，供之后添加中文片名；此处不要工具、移动人影或亮光斑。延续左侧窗光，文案区域对比柔和稳定，封面补布位置不变。同一本小型靛蓝布面旧书，前封面右下角有小块浅米色矩形补布，纸边自然泛黄并保留旧痕。参考图只规定书的身份与工作台材质，不强制沿用构图或合书姿态。普通木质修复台，左侧窗户柔和晨光，色彩自然克制。不拍脸，无人声、音乐、叠加文字或标志；只有安静工作室底噪和轻微接触声。不要雨、镜面、森林意象、魔法变化或夸张粒子。摄影机固定：镜内不变焦、摇移、环绕或切镜。手部合理，书的几何稳定，接触连续。",
          "translationStatus": "corresponding_translation_not_submitted",
          "requestedDuration": 5,
          "type": "i2v",
          "referenceRole": "book_identity_and_workshop_materials_not_first_frame"
        },
        "actualMedia": {
          "video": "https://github.com/yydshly/1021_codex_project/releases/download/melies-media-20261022/book-repair--book-4.mp4",
          "poster": "generated/book-repair/book-4.jpg",
          "duration": 5.056,
          "width": 1902,
          "height": 1092,
          "frameRate": "24/1",
          "hasAudio": true,
          "byteSize": 5208656,
          "videoCodec": "h264"
        },
        "edit": {
          "sourceStart": 0.5,
          "duration": 4,
          "timeline": {
            "start": 14,
            "end": 18
          }
        }
      }
    ],
    "reusePatterns": [
      {
        "id": "hands-as-characters",
        "title": "用袖口和交接动作表达两人关系",
        "whenToUse": "手工、维修或物品交还故事，不需要露脸时。",
        "retain": "用可辨袖口区分角色，在交接后共同托住物品并停留。",
        "adapt": "替换物品、工艺、袖口与交付关系，不照抄旧书。",
        "evidenceShotIds": [
          "book-4"
        ],
        "evidenceLevel": "handover_visually_observed_in_one_run",
        "limit": "本次交还关系可读；是否让观众感到被珍视未测试，其他物品需另验手与道具接触。"
      },
      {
        "id": "identity-is-not-framing",
        "title": "把身份一致与构图、对象结构分开验收",
        "whenToUse": "同一道具跨开合状态、景别或操作镜头出现时。",
        "retain": "保留身份图和文字锚点，但分别检查物体数量、开合状态、机位与细节尺度。",
        "adapt": "可用于工具、包装、衣物或其他需要操作的道具；专用构图 / 起始状态参考是待测试改法。",
        "evidenceShotIds": [
          "book-1",
          "book-2",
          "book-3"
        ],
        "evidenceLevel": "advice_from_one_run_with_framing_and_structure_failures",
        "limit": "本次颜色与材质线索较一致，并未保证微距或单一书体；专用参考的改法尚未生成验证。"
      },
      {
        "id": "contact-before-style",
        "title": "先检查动作位置、连接轴与状态变化",
        "whenToUse": "穿针、合拢、开门、开盖等动作必须依赖物体结构时。",
        "retain": "先明确同一物体的结构、动作作用点、固定部分与转轴，再检查施力、运动路径和前后状态；最后评价景别与风格。",
        "adapt": "按新物体重建连接关系，例如门铰链、盒盖或其他操作部位，不照抄画面左右或书本工艺。",
        "evidenceShotIds": [
          "book-2",
          "book-3"
        ],
        "evidenceLevel": "failure_derived_checklist_not_validated_prompt_fix",
        "limit": "本次穿针落点与合书轴关系存在偏差；该检查方法来自单次失败观察，候选新参考与提示词未再次生成。"
      },
      {
        "id": "title-space-through-motion",
        "title": "文案空间要覆盖整段运动",
        "whenToUse": "交接、人物移动或动作镜头还要容纳片名时。",
        "retain": "先检查主体与所有手臂的运动范围，再使用实际文案框判断可读位置；保留无字原片。",
        "adapt": "可以重新设计动作布局，也可在首版后期使用实际空出的区域，但要记录偏离原构图。",
        "evidenceShotIds": [
          "book-4"
        ],
        "evidenceLevel": "post_layout_adapted_after_negative_space_failure",
        "limit": "本次右上片名可放置不等于右侧 40% 留白实现；新布局建议未生成验证。"
      }
    ],
    "modelUse": {
      "retrieveWhen": [
        "需要手工、修复、照料、交还的动作故事",
        "需要理解统一参考图未能解决微距、开合状态与对象重复的情况",
        "需要人与道具接触、实际运动文案区的检查标准"
      ],
      "workflow": [
        "先读取本次目标、原分镜和技巧理由，再看原始素材与逐镜实际输入。",
        "优先读取 book-2、book-3 的 logicReview 和证据帧；把动作作用位置、书体数量、开合轴及前后状态作为内容正确性检查，不能用镜头术语或最终姿态代替。",
        "保留可读的交还关系、角色袖口和身份线索，明确微距、结构、接触、留白未充分达标。",
        "围绕新简报重写对象、事件与节奏，引用 book-repair 及真实技巧 ID；不要照搬旧书情节。",
        "新改法先选一项变量，准备对应参考并列验收方法，标记为尚未验证。",
        "新生成另记执行与结果，不把这次一个样本推广为稳定能力。"
      ],
      "doNotAssume": [
        "拿着针不等于穿过正确装订孔；材质相似不等于同一本书结构正确。",
        "出现“穿针”“合书”的外观不等于动作逻辑成立；更换光线、景别或剪辑不能自动修复错误落点、连接轴和运动方向。",
        "原设计稿的未生成状态是设计阶段历史，实际执行记录单独保存。",
        "不能将后期排字归为模型生成文字能力，也不能把右上可放片名说成右侧 40% 留白达标。",
        "不因增加更多相机和风格术语而忽视动作接触与事件关系。",
        "实际英文、对应中文译文、原因假设、观察和候选修正分别使用。"
      ]
    },
    "result": {
      "status": "completed_with_design_deviations",
      "video": "https://github.com/yydshly/1021_codex_project/releases/download/melies-media-20261022/book-repair--let-the-story-continue.mp4",
      "poster": "generated/book-repair/poster.jpg",
      "duration": 18,
      "width": 1920,
      "height": 1080,
      "frameRate": "24/1",
      "costNote": "估算 600 点；服务返回三段各 150 点、一段 300 点，合计 750 点。生成前后查询余额未变化，实际扣费未确认，返回字段不作为已核销账单。参考图由内置 image_gen 生成，未提交 ChatArt 图片付费任务。"
    },
    "techniqueIds": [
      "composition-negative-space",
      "lenses-macro",
      "lighting-volumetric-light"
    ],
    "techniques": [
      {
        "id": "composition-negative-space",
        "nameZh": "留白构图",
        "sourceUrl": "https://melies.co/cinematic-techniques/composition/negative-space"
      },
      {
        "id": "lenses-macro",
        "nameZh": "微距镜头",
        "sourceUrl": "https://melies.co/cinematic-techniques/lenses/macro"
      },
      {
        "id": "lighting-volumetric-light",
        "nameZh": "体积光",
        "sourceUrl": "https://melies.co/cinematic-techniques/lighting/volumetric-light"
      }
    ],
    "execution": {
      "model": "Seedance 2.0",
      "requestedTarget": {
        "duration": 18,
        "aspectRatio": "16:9",
        "resolution": 1080
      },
      "generatedDurations": [
        5,
        10,
        5,
        5
      ],
      "editDurations": [
        4,
        6,
        4,
        4
      ],
      "referenceImage": {
        "provider": "built-in image_gen",
        "image": "https://github.com/yydshly/1021_codex_project/releases/download/melies-media-20261022/book-repair--book-reference.png",
        "role": "book identity and workshop materials; not a first frame",
        "actualResolution": [
          1672,
          941
        ]
      },
      "postProduction": {
        "order": [
          "book-1",
          "book-2",
          "book-3",
          "book-4"
        ],
        "durations": [
          4,
          6,
          4,
          4
        ],
        "transition": "Straight cuts after readable actions; no graphic match or morph.",
        "endTitle": "让故事，继续",
        "titleMethod": "Add in post-production in the actually verified right-side safe area.",
        "audio": "Preserve native contact / room sound where suitable; short fades, no generated narration."
      },
      "cost": {
        "estimatedCredits": 600,
        "serviceReportedCredits": 750.0,
        "deductionVerified": false,
        "note": "估算 600 点；服务返回三段各 150 点、一段 300 点，合计 750 点。生成前后查询余额未变化，实际扣费未确认，返回字段不作为已核销账单。参考图由内置 image_gen 生成，未提交 ChatArt 图片付费任务。"
      }
    },
    "sourceRecords": [
      "app/book-case-memory.json",
      "app/studio-book-repair.json",
      "app/production/book-design-prompts.json",
      "app/production/book-repair-plan.json",
      "app/production/book-repair-edit-settings.json",
      "app/production/book-1-execution.json",
      "app/production/book-2-execution.json",
      "app/production/book-3-execution.json",
      "app/production/book-4-execution.json"
    ],
    "presentation": {
      "inlineShotMedia": true
    },
    "revisions": [
      {
        "id": "book-repair-r2",
        "parentCaseId": "book-repair",
        "recordedAt": "2026-10-22",
        "title": "让故事，继续 · 两镜动作返修",
        "status": "completed_qualitative_revision",
        "summary": "已只重做穿针与合书并剪回 18 秒：穿针从叠书／纸页外侧落点改为单一书体的中央折缝孔；合书从另一边翻起改为沿左侧长书脊放下同一前封面。刷拭和交还沿用首版素材与取材范围。穿针只展示小幅插入，未展示下侧出针与完整拉线。",
        "goal": "延续修复、照料、交还的故事和原有材质光线，优先纠正针的作用位置与合书轴，不以镜头美术掩盖动作逻辑。",
        "scope": {
          "regeneratedShotIds": [
            "book-2",
            "book-3"
          ],
          "retainedShotIds": [
            "book-1",
            "book-4"
          ],
          "comparisonType": "targeted_partial_revision_not_controlled_experiment",
          "baselineExecutions": 1,
          "partialRevisionBatches": 1,
          "newVideoTasks": 2
        },
        "reviewBasis": "依据两段完整原片的每 0.25 秒抽样、起始／中段／末段接触区原尺寸帧，定性追踪书体、孔位和转轴。不是对真实修复工艺或每个像素的验证。",
        "shots": [
          {
            "shotId": "book-2-r2",
            "title": "穿针位置",
            "assessment": "target_location_and_single_book_visually_improved",
            "assessmentLabel": "孔位与书体改善 · 完整穿线未验证",
            "change": "用一册打开的书与中央折缝孔的专用首尾帧，替换统一合书身份图；动作收窄为同一根针在同一孔的小幅插入，不再尝试完整针线循环。",
            "observedEffect": "原片 0.1–9.85 秒始终可见一册打开的靛蓝书，直接放在亚麻书托上；针尖保持在中央折缝沿书脊线的同一既有孔，右手缓慢靠近，露出的针杆逐渐变短。未再出现首版的“开书叠在合书上”和针落在外侧纸面的关系。",
            "problems": [
              "动作幅度很小，接近缓慢推进与停留；不能把它描述为完整缝好一次。",
              "针眼部分被手指遮挡，书帖下侧出针点与线穿透后的路径未显示，完整穿线连续性和工艺正确性仍未验证。",
              "专用近景、书托、起始状态、首尾帧与文字约束共同变化，不能单独归因于某条提示词或首尾帧模式。"
            ],
            "check": "先认单一书体与中央折缝，再跟踪同一个孔和针尖；核对针没有换到外侧纸面或手指。入口改善与整条针线运动链分别验收，下侧不可见就保留未验证。",
            "evidenceFrames": [
              {
                "image": "generated/book-repair-r2/evidence/needle-1s.jpg",
                "sourceSeconds": 1,
                "filmSeconds": 4.5,
                "caption": "返修原片 1.00 秒 / 新成片 4.50 秒：单一开书，针尖对应中央折缝孔。"
              },
              {
                "image": "generated/book-repair-r2/evidence/needle-3s.jpg",
                "sourceSeconds": 3,
                "filmSeconds": 6.5,
                "caption": "返修原片 3.00 秒 / 新成片 6.50 秒：同一孔位，右手靠近，针杆缩短。"
              },
              {
                "image": "generated/book-repair-r2/evidence/needle-6s.jpg",
                "sourceSeconds": 6,
                "filmSeconds": 9.5,
                "caption": "返修原片 6.00 秒 / 新成片 9.50 秒：孔位与单一书体仍在，下侧出针不可见。"
              }
            ],
            "before": {
              "shotId": "book-2",
              "actualMedia": {
                "video": "https://github.com/yydshly/1021_codex_project/releases/download/melies-media-20261022/book-repair--book-2.mp4",
                "poster": "generated/book-repair/book-2.jpg",
                "duration": 10.048,
                "width": 1902,
                "height": 1092,
                "frameRate": "24/1",
                "videoCodec": "h264",
                "hasAudio": true,
                "byteSize": 6441698
              },
              "logicReview": {
                "assessment": "not_passed",
                "label": "动作逻辑未通过",
                "basis": "assistant_visual_recheck_after_user_feedback",
                "userFeedback": "穿针的位置不对。",
                "expected": "按本方案预设，针应作用于同一本书书脊处既有装订孔；入口、出口与线的走向要能对应。不是泛化断言所有书籍装订都使用同一工艺。",
                "observed": "针尖落在页片上的点位，打开的页块与下方合书形成疑似叠书结构，目标修复部位和书体关系没有成立。",
                "check": "先确认只有一个书体、书脊和目标孔，再检查针入口—出口—线是否围绕同一孔连续，最后检查动作是否真的改变目标部位。",
                "evidenceFrames": [
                  {
                    "image": "generated/book-repair/evidence/needle-4s.jpg",
                    "sourceSeconds": 4,
                    "filmSeconds": 7.5,
                    "caption": "原片 4.00 秒 / 成片 7.50 秒：针落点与疑似叠书结构。"
                  }
                ]
              }
            },
            "techniqueIds": [
              "lenses-macro"
            ],
            "taskId": "1035124",
            "actualInput": {
              "en": "10 seconds, 16:9, one continuous locked close-up. Use the provided FIRST and LAST frames as the exact start and end states of ONE slow needle INSERTION, not a whole repair process. There is ONE open book on a linen cradle, not an open book stacked on a closed book. Identify the existing hole at the central paper FOLD/GUTTER on the spine line, immediately under the needle tip in the first frame. Keep that very hole fixed. Pause briefly, then move the same single needle point-first gradually deeper into that SAME existing center-fold hole, until about half the visible shaft has disappeared through it as in the last frame. Only one small insertion, then a quiet hold. Keep the visible thread connected to the same needle eye and following naturally. Do not pull a needle out elsewhere, create a new hole, sew through a page fore-edge, pierce fingers, repeat the stitch or pretend to finish the book. The underside and needle exit may remain occluded; do not invent a second exposed book. The left hand steadies the same paper section, the right thumb and forefinger follow the needle; keep the contact zone visible. Paper folds, existing stitches, covers and book count remain stable. Same aged indigo cloth, yellowed paper, linen sleeves, wooden worktable and soft morning light from the left. Camera and focus fixed, sufficient depth of field at hole and needle; no zoom, cuts, orbit, magic, particles, labels or text. No voices or music, only quiet workshop room tone and very soft contact sound.",
              "translationZh": "10 秒，16:9，一个连续固定近景。用所给首帧与尾帧规定一次缓慢插针的起止状态，不演完整修书流程。只有一本打开并支在亚麻书托上的书，不是在合上的书上叠一本打开的书。目标是首帧针尖正下方、沿书脊线的纸张中央折缝／书沟上的既有孔；该孔位置固定。短暂停顿后，同一根针尖朝前缓慢深入同一个中央折缝孔，直到约一半可见针杆进入孔中，达到尾帧状态。只做一次小幅插入，再安静停留。可见线始终连在同一个针眼并自然跟随。不从别处抽出针，不造新孔，不穿纸张外沿，不扎手，不重复穿针，不假装完成整本书。下侧与出针点可以被遮挡，不凭空生成第二本暴露的书。左手稳住同一书帖，右手拇指和食指随针移动，接触区保持可见。纸折、既有针脚、封面与书的数量稳定。延续靛蓝旧布面、泛黄纸、亚麻袖口、木台与左侧柔和晨光。机位与焦点固定，孔和针附近景深充分；不变焦、切镜、环绕、魔法、粒子、标签或文字。无人声、无音乐，仅安静工作室底噪与很轻的接触声。",
              "submittedLanguage": "en",
              "translationStatus": "corresponding_translation_not_submitted",
              "requestedDuration": 10,
              "referenceRole": "dedicated_first_and_last_frames_not_only_identity"
            },
            "actualMedia": {
              "video": "https://github.com/yydshly/1021_codex_project/releases/download/melies-media-20261022/book-repair-r2--book-2-r2.mp4",
              "poster": "generated/book-repair-r2/book-2-r2.jpg",
              "duration": 10.048,
              "width": 1902,
              "height": 1092,
              "frameRate": "24/1",
              "videoCodec": "h264",
              "hasAudio": true,
              "byteSize": 7995875
            },
            "referenceFrames": [
              {
                "role": "firstFrame",
                "image": "https://github.com/yydshly/1021_codex_project/releases/download/melies-media-20261022/book-repair-r2--reference--needle-first.png"
              },
              {
                "role": "endFrame",
                "image": "https://github.com/yydshly/1021_codex_project/releases/download/melies-media-20261022/book-repair-r2--reference--needle-last.png"
              }
            ],
            "edit": {
              "timelineShotId": "book-2",
              "sourceShotId": "book-2-r2",
              "source": "assets/generated/book-repair-r2/book-2-r2/video_20261022141542.mp4",
              "sourceSha256": "076ac80f21c5256ffe107ba25e30e00a25ab0a11a470e3d7834a7a82e3b34137",
              "sourceStart": 0.5,
              "duration": 6,
              "timeline": {
                "start": 4,
                "end": 10
              }
            }
          },
          {
            "shotId": "book-3-r2",
            "title": "合书方向",
            "assessment": "hinge_and_cover_direction_visually_improved_in_small_arc",
            "assessmentLabel": "同一书脊合拢可读 · 小角度动作",
            "change": "首帧只让前封面略微抬起，页块与后封面已经平放；左手稳书脊，右手沿自由边绕同一左侧长书脊放下，尾帧明确同一封面闭合状态。保留柔和窗光，暂不追求强化光束。",
            "observedEffect": "原片约 0.1–1 秒前封面保持小角度抬起，约 1–3 秒右手随封面自由边下落，左侧长书脊与页块基本留在原位；约 3 秒后封面落平并停留。补布一直随同一前封面移动，没有首版从远侧短边竖起再翻合的明显轴关系矛盾。",
            "problems": [
              "起始动作从完全展开缩小为仅前封面略抬，不是首版整段展开动作的同幅度复现。",
              "未量测精确旋转角度或逐点刚体误差；只作本段方向与连接关系的定性判断。",
              "本轮不再强化体积光，不能用本镜证明该灯光规则已达标；跨镜布面磨损与补布形状仍有细节差异。"
            ],
            "check": "追踪同一左侧长书脊、移动封面、右侧自由边和补布；固定页块不被翻起，封面只绕同一长边下降，右手接触随动。最后合上不能代替中间轴关系检查。",
            "evidenceFrames": [
              {
                "image": "generated/book-repair-r2/evidence/closure-0_1s.jpg",
                "sourceSeconds": 0.1,
                "filmSeconds": 10.1,
                "caption": "返修原片 0.10 秒 / 新成片 10.10 秒：左侧书脊固定，右侧自由边抬起。"
              },
              {
                "image": "generated/book-repair-r2/evidence/closure-1_75s.jpg",
                "sourceSeconds": 1.75,
                "filmSeconds": 11.75,
                "caption": "返修原片 1.75 秒 / 新成片 11.75 秒：右手沿自由边下放，补布随封面移动。"
              },
              {
                "image": "generated/book-repair-r2/evidence/closure-3_5s.jpg",
                "sourceSeconds": 3.5,
                "filmSeconds": 13.5,
                "caption": "返修原片 3.50 秒 / 新成片 13.50 秒：同一封面落平，页块留在台面。"
              }
            ],
            "before": {
              "shotId": "book-3",
              "actualMedia": {
                "video": "https://github.com/yydshly/1021_codex_project/releases/download/melies-media-20261022/book-repair--book-3.mp4",
                "poster": "generated/book-repair/book-3.jpg",
                "duration": 5.056,
                "width": 1902,
                "height": 1092,
                "frameRate": "24/1",
                "hasAudio": true,
                "byteSize": 3867307,
                "videoCodec": "h264"
              },
              "logicReview": {
                "assessment": "not_passed",
                "label": "动作逻辑未通过",
                "basis": "assistant_visual_recheck_after_user_feedback",
                "userFeedback": "合书的方向不对。",
                "expected": "先确定这本书的书脊和封面连接边；封面应围绕同一连接轴合拢，固定侧、书脊和页块不能在动作中换边或另生转轴。",
                "observed": "左侧仍可见书脊结构，远侧板状封面 / 页片却竖起再落下，连接轴与移动方向关系不一致；约 1 秒后手部接触也不持续可读。",
                "check": "对照展开、半合、合拢三帧，追踪同一书脊、封面连接边、自由边和补布；核对旋转轴、手施力方向与最终封面朝向能否连续解释。",
                "evidenceFrames": [
                  {
                    "image": "generated/book-repair/evidence/closure-0_1s.jpg",
                    "sourceSeconds": 0.1,
                    "filmSeconds": 10.1,
                    "caption": "原片 0.10 秒 / 成片 10.10 秒：展开状态与可见书脊。"
                  },
                  {
                    "image": "generated/book-repair/evidence/closure-1s.jpg",
                    "sourceSeconds": 1,
                    "filmSeconds": 11,
                    "caption": "原片 1.00 秒 / 成片 11.00 秒：远侧板状封面 / 页片竖起。"
                  },
                  {
                    "image": "generated/book-repair/evidence/closure-2s.jpg",
                    "sourceSeconds": 2,
                    "filmSeconds": 12,
                    "caption": "原片 2.00 秒 / 成片 12.00 秒：落下后的书脊与封面关系。"
                  }
                ]
              }
            },
            "techniqueIds": [
              "lighting-volumetric-light"
            ],
            "taskId": "1035123",
            "actualInput": {
              "en": "5 seconds, 16:9. Animate ONE gentle book closure between these first and last frames. At the start the front cover alone is slightly raised. The left LONG SPINE is the single fixed hinge: keep it and the back cover and the entire yellowed page block stationary on the wooden table. The right hand maintains gentle fingertip contact with the raised front cover's RIGHT FREE EDGE and slowly lowers that rigid cover about the LEFT LONG SPINE HINGE, through one continuous small arc, until it lies flat on the page block by about 3 seconds; hold for the remaining time. The left hand stays at the spine to steady the book. The small beige patch travels WITH THE SAME FRONT COVER and remains at its lower-right outer corner. Never pivot at a short edge, lift the page block, turn a paper leaf into a cover, flip the whole book, detach the hinge or add a second book. Keep geometry and hand contact continuously readable, no extra gesture. Preserve the same aged indigo cloth, patch, linen sleeves, tabletop, soft left window light and restrained colors. Fixed camera and focus, no cuts, zoom, orbit, exaggerated light beam, dust, magic, text or logos. Quiet workshop room tone and a subtle cloth-cover contact sound, no speech or music.",
              "translationZh": "5 秒，16:9。在首尾帧之间只做一次轻柔合书。开始时只有前封面略微抬起。左侧长书脊是唯一固定转轴：它、后封面与整块泛黄书页都固定在木台上。右手指尖持续轻触抬起前封面的右侧自由边，绕左侧长书脊连接轴沿一条连续小圆弧缓慢放下这一块硬封面，约 3 秒时平放到页块上，余下时间停住。左手留在书脊处稳住书。小块米色补布随同一前封面移动，始终位于其外侧右下角。不得绕短边旋转、抬起页块、把纸页变成封面、翻转整本书、断开连接轴或增加第二本书。书体与手部接触全过程可读，不加额外手势。保留靛蓝旧布面、补布、亚麻袖口、台面、左侧柔和窗光和克制色彩。机位和焦点固定，不切镜、变焦、环绕、夸张光束、纸尘、魔法、文字或标志。只有安静工作室底噪和轻微布面合拢接触声，无人声和音乐。",
              "submittedLanguage": "en",
              "translationStatus": "corresponding_translation_not_submitted",
              "requestedDuration": 5,
              "referenceRole": "dedicated_first_and_last_frames_not_only_identity"
            },
            "actualMedia": {
              "video": "https://github.com/yydshly/1021_codex_project/releases/download/melies-media-20261022/book-repair-r2--book-3-r2.mp4",
              "poster": "generated/book-repair-r2/book-3-r2.jpg",
              "duration": 5.056,
              "width": 1902,
              "height": 1092,
              "frameRate": "24/1",
              "videoCodec": "h264",
              "hasAudio": true,
              "byteSize": 4079382
            },
            "referenceFrames": [
              {
                "role": "firstFrame",
                "image": "https://github.com/yydshly/1021_codex_project/releases/download/melies-media-20261022/book-repair-r2--reference--closure-first.png"
              },
              {
                "role": "endFrame",
                "image": "https://github.com/yydshly/1021_codex_project/releases/download/melies-media-20261022/book-repair-r2--reference--closure-last.png"
              }
            ],
            "edit": {
              "timelineShotId": "book-3",
              "sourceShotId": "book-3-r2",
              "source": "assets/generated/book-repair-r2/book-3-r2/video_20261022141518.mp4",
              "sourceSha256": "c49c6c764313e80a6800db8f7ef12633dc2d733620aecb9f602445d74f58e92b",
              "sourceStart": 0,
              "duration": 4,
              "timeline": {
                "start": 10,
                "end": 14
              }
            }
          }
        ],
        "lessons": [
          "先把对象结构与动作起止状态做对，再叠加镜头语言：本轮专用参考中先确定单一书体、中缝孔、固定页块和移动封面。它们与身份图承担不同任务。",
          "开合类动作以物体自身的连接轴定义路径，同时追踪自由边与识别标记；画面左／右只能辅助描述，不能代替连接关系。该检查可迁移到盒盖、门、机械开合等新题材。",
          "把复杂动作缩成一个清楚阶段，有助于这次画面表达：一针只推进同一孔，合书只从略抬到落平。代价是不能宣称展示了完整工艺或大幅度开合。",
          "首尾图片正确仍需检查中间帧。验收作用点、接触、路径和终态；未看见针的出口与完整拉线，就单独保留验证缺口。",
          "保留首版失败与局部返修的准确输入、参考、素材和剪辑范围；此次多项改动共同进行，只能记录局部改善，不能推导通用成功率或单一方法的因果结论。"
        ],
        "limits": [
          "仍为香水、旧书两个题材；旧书为一次四镜首版加一次两镜局部返修，不新增第三个题材，也不把两镜算两个独立重复实验。",
          "参考图、构图、动作范围、首尾约束和提示词同时变化，不是单变量实验，未测试其他模型或重复稳定性。",
          "仅判断这两段可见入口位置与合书轴改善；完整装订工艺、精确运动几何和受众情绪未验证。",
          "声音仅检查音轨存在和解码，未听评内容、接触同步或音色；不宣称音频内容达标。",
          "刷拭与交还的原始文件及取材起止保持一致；最终成片重新编码与整片响度处理，不宣称输出逐像素或音频采样锁定。"
        ],
        "result": {
          "status": "completed_targeted_revision_with_remaining_limits",
          "video": "https://github.com/yydshly/1021_codex_project/releases/download/melies-media-20261022/book-repair-r2--let-the-story-continue-r2.mp4",
          "poster": "generated/book-repair-r2/poster.jpg",
          "duration": 18,
          "width": 1920,
          "height": 1080,
          "frameRate": "24/1"
        },
        "costNote": "本轮仅两个视频任务：估算 240＋120＝360 点，服务返回 300＋150＝450 点。生成前后查询余额未变化，实际扣费未确认；服务返回字段不是已核销账单。四张动作参考由内置 image_gen 制作，未提交 ChatArt 图片付费任务。",
        "originalResult": {
          "status": "completed_with_design_deviations",
          "video": "https://github.com/yydshly/1021_codex_project/releases/download/melies-media-20261022/book-repair--let-the-story-continue.mp4",
          "poster": "generated/book-repair/poster.jpg",
          "duration": 18,
          "width": 1920,
          "height": 1080,
          "frameRate": "24/1",
          "costNote": "估算 600 点；服务返回三段各 150 点、一段 300 点，合计 750 点。生成前后查询余额未变化，实际扣费未确认，返回字段不作为已核销账单。参考图由内置 image_gen 生成，未提交 ChatArt 图片付费任务。"
        },
        "cost": {
          "estimatedCredits": 360,
          "serviceReportedCredits": 450.0,
          "deductionVerified": false
        },
        "referenceGeneration": {
          "provider": "built-in image_gen",
          "modelVersion": "not returned",
          "seed": "not returned",
          "status": "completed_and_visually_reviewed",
          "references": [
            {
              "name": "needle-first.png",
              "role": "first_frame",
              "prompt": "Use case: ads-marketing. Asset: photorealistic 16:9 FIRST FRAME for a quiet book-repair film. Input image 1 is ONLY the identity/material/light reference, NOT a pose to copy.\nCreate a new tight close-up of ONE small aged indigo clothbound book, already open in a shallow V on a neutral linen cradle, on this wooden worktable. The book is a single connected object: left and right page blocks meet at ONE central folded gutter, covers beneath their respective page blocks, nothing stacked underneath. Soft morning light from left, plain linen-sleeved adult hands, no face. Camera almost above the open gutter, sufficiently close to see one small PRE-EXISTING sewing hole exactly on the CENTER FOLD of one paper section along the spine. This is the hole to stitch; the paper's outside edge must be visibly far from it. The left hand steadies the section well clear of the hole. The right hand holds a single slender needle with a single beige thread through its eye, needle tip just at this existing gutter hole, poised to pass through. Needle, hole, paper fold and thread are readable together, sufficient depth of field. One needle only. Keep most palms outside central contact area. The blue covers may be only partly visible at the outside frame edges. No closed blue book below, no second book, no loose extra page stack, no needle through page fore-edge or fingers. Realistic restrained paper fibers, believable anatomy. No typography, diagrams, labels, logos or magic. Landscape 16:9, intended 2048x1152.",
              "input": "assets/generated/book-repair/reference/book-reference.png",
              "path": "assets/generated/book-repair-r2/reference/needle-first.png",
              "sha256": "e90d6698805557db4d92f08204d017ba1022ecf19cc3ddd60ed5aad2798e9599",
              "actualResolution": [
                1672,
                941
              ],
              "inputSha256": "cddcfd08b0253ab26319b87048c71151be921d2f2faacbaeede95c58937b5151"
            },
            {
              "name": "needle-last.png",
              "role": "end_frame",
              "prompt": "Use case: precise-object-edit. Edit image1 into the END FRAME of a single needle-insertion motion. Keep the very same single open indigo book, center gutter geometry, pre-existing binding holes, linen cradle, left hand, camera, light, materials and framing. Change ONLY the right hand and needle's progress: the SAME needle is now pushed about half its length THROUGH the SAME center-fold hole directly beneath its original tip. The visible metal shaft is shorter as its lower length has disappeared into that existing fold hole, not into a new hole or a finger. Right thumb and forefinger move closer to the hole while holding the remaining upper needle. The one connected beige thread follows the needle eye with a natural loose curve; no new thread or duplicate needle. This endpoint is the insertion phase only; do NOT invent an exposed underside or show a completed sewing process. Keep the center-fold hole/contact visible, palms not covering it. Keep all page edges, covers, support and left hand where they were. Photorealistic same shot, 16:9. No labels or text.",
              "input": "assets/generated/book-repair-r2/reference/needle-first.png",
              "path": "assets/generated/book-repair-r2/reference/needle-last.png",
              "sha256": "236e32d7c83cb4262a09532ae51dbd009847da02fd081cde8dc5229d550b7456",
              "actualResolution": [
                1672,
                941
              ],
              "inputSha256": "e90d6698805557db4d92f08204d017ba1022ecf19cc3ddd60ed5aad2798e9599"
            },
            {
              "name": "closure-first.png",
              "role": "first_frame",
              "prompt": "Use case: ads-marketing. Asset: photorealistic 16:9 FIRST FRAME for the book-closing shot of a quiet repair film. Image1 is identity/material/light reference. Keep this same small old indigo clothbound book, beige rectangular patch at lower-right frontcover corner, yellowed pageblock, worn LEFT long spine, wooden worktable and soft morning left windowlight.\nNew pose: a single book lying with its BACK COVER flat on the table and its entire pageblock resting flat on the back cover. The FRONT COVER alone is raised only about 30 degrees above the pageblock, rotating on the LEFT LONG SPINE HINGE. Clearly show that raised cover still attached along the full left long edge of the pageblock; no other pivot. The open gap is on the RIGHT fore-edge. The beige patch is on the raised front cover near its lower-right free corner. Camera looking diagonally down from front-right, see the worn left spine connection and right-side triangular open gap in one shot; book fills most of frame. One linen-sleeved hand steadies the left spine on the table, another linen-sleeved hand places fingertips on top of the raised cover's RIGHT FREE EDGE, poised to gently lower it. Hands anatomically plausible, no faces. The cover is ONE rigid rectangular board, not a bending paper leaf. Nothing else moves, no extra book, no pageblock lifting, no second cover on top, no top-edge hinge. Natural paper texture, muted indigo, tactile intimate documentary photography, enough depth of field for hinge and cover. No text, labels, diagrams or logos. Landscape16:9, intended2048x1152.",
              "input": "assets/generated/book-repair/reference/book-reference.png",
              "path": "assets/generated/book-repair-r2/reference/closure-first.png",
              "sha256": "cffb151a596a9f4e0355654f6371d1cda2840e751d1d8526d47fb271569dd0c2",
              "actualResolution": [
                1672,
                941
              ],
              "inputSha256": "cddcfd08b0253ab26319b87048c71151be921d2f2faacbaeede95c58937b5151"
            },
            {
              "name": "closure-last.png",
              "role": "end_frame",
              "prompt": "Use case: precise-object-edit. Edit image1 into the END FRAME of this book-closing motion. Change ONLY the raised FRONT COVER and following right fingertips: lower the same rigid blue front cover about its existing LEFT LONG SPINE HINGE until it lies fully flat on this same stationary pageblock. The right free edge comes down to meet the pageblock right fore-edge. Same beige rectangular patch stays at same lower-right corner ON the same frontcover. The left spine, backcover, pageblock, left hand, table, camera, light and framing stay fixed. Right fingertips follow the same free edge down and stay gently touching the now-closed cover near the patch. No whole-book translation or flip, no rotation at the far short edge, no new cover, no extra book, no bent board. Closed-book geometry physically plausible, final cover outline aligns with pageblock. Same realistic photograph, 16:9, no text or labels.",
              "input": "assets/generated/book-repair-r2/reference/closure-first.png",
              "path": "assets/generated/book-repair-r2/reference/closure-last.png",
              "sha256": "405993e81e6bb497b985afef4646253f7b918f7f854e3194a12f0b2c0cea04a3",
              "actualResolution": [
                1672,
                941
              ],
              "inputSha256": "cffb151a596a9f4e0355654f6371d1cda2840e751d1d8526d47fb271569dd0c2"
            }
          ],
          "observations": [
            "穿针首尾参考均为一本打开的书，针尖在中央折缝既有孔；尾帧只示意插入进度，下侧不可见。",
            "合书首尾参考有同一左侧长书脊、抬起与放平的同一前封面、固定页块和对应补布。",
            "这是生成动作参考，不是实拍工艺证据；连续运动仍需实际视频检查。"
          ]
        },
        "retainedSourceRecords": {
          "book-1": {
            "shotId": "book-1",
            "source": "assets/generated/book-repair/book-1/video_20261022131931.mp4",
            "sha256": "175be6b8b92bd06d08eb3da7252d2bf402b051b6567c6c244e167639015e0219",
            "edit": {
              "start": 0.5,
              "duration": 4,
              "reason": "保留进入后的刷拭动作；不以裁切伪装成纸纤维微距。"
            }
          },
          "book-4": {
            "shotId": "book-4",
            "source": "assets/generated/book-repair/book-4/video_20261022131725.mp4",
            "sha256": "45a23e411f9ae73db0eb8efcce6f9265fcdcc1c1033ae2229956c65ea74d0259",
            "edit": {
              "start": 0.5,
              "duration": 4,
              "reason": "覆盖交还和共同托书停留。"
            }
          }
        },
        "sourceRecords": [
          "app/book-revision-r2.json",
          "app/production/book-repair-r2-plan.json",
          "app/production/book-r2-edit-record.json",
          "app/production/book-r2-reference-prompts.json",
          "app/production/book-2-r2-execution.json",
          "app/production/book-3-r2-execution.json"
        ]
      }
    ],
    "latestResult": {
      "status": "completed_targeted_revision_with_remaining_limits",
      "video": "https://github.com/yydshly/1021_codex_project/releases/download/melies-media-20261022/book-repair-r2--let-the-story-continue-r2.mp4",
      "poster": "generated/book-repair-r2/poster.jpg",
      "duration": 18,
      "width": 1920,
      "height": 1080,
      "frameRate": "24/1"
    },
    "revisionSummary": "已只重做穿针与合书并剪回 18 秒：穿针从叠书／纸页外侧落点改为单一书体的中央折缝孔；合书从另一边翻起改为沿左侧长书脊放下同一前封面。刷拭和交还沿用首版素材与取材范围。穿针只展示小幅插入，未展示下侧出针与完整拉线。"
  }
};
