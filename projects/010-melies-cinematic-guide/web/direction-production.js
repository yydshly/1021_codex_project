window.DIRECTION_PRODUCTION = {
  "schemaVersion": 1,
  "id": "tea-moment",
  "title": "把片刻，留给自己",
  "status": "completed",
  "preparedOn": "2026-10-22",
  "target": {
    "duration": 15,
    "aspectRatio": "16:9",
    "shotCount": 3,
    "resolution": 1080,
    "nativeAudio": true
  },
  "designSource": {
    "path": "app/direction-example.json",
    "sha256": "a220cf77c473953b6ca74c28989b1f9618255496d33dd6f941fdb4205652f93a"
  },
  "estimatedCredits": 360,
  "historicalServiceCostReference": {
    "credits": 450,
    "scope": "此前同规格5秒素材服务返回每段150点；本轮预期参考，非报价或实际扣费",
    "previousCaseIds": [
      "rain-to-forest",
      "book-repair"
    ]
  },
  "budgetApproval": {
    "confirmedAt": "2026-10-22T09:12:09.000492+00:00",
    "userResponse": "确认，生成三镜并完成剪辑与复盘入库",
    "model": "Seedance 2.0",
    "resolution": 1080,
    "aspectRatio": "16:9",
    "nativeAudio": true,
    "generationDurations": [
      5,
      5,
      5
    ],
    "estimatedCredits": 360,
    "historicalServiceCostReference": 450,
    "noAutomaticRetry": true,
    "inputPromptHashes": {
      "tea-1": "9ddee10b698f77480afa0f53fbcbed0756f32da0ffc3b4f01283bbe4fd0771b5",
      "tea-2": "ef01f0f7240ed0cf0e23af079b42f91689ef6e93e3859cf0fadca6fa5fe0cfd2",
      "tea-3": "023ee2d6d150780614c3ea56389a9e549efa7de596826a7b648c9669f821f14a"
    }
  },
  "accountDeductionVerified": false,
  "confirmationRequirement": {
    "source": "D:/codex/home/skills/chatart-skill/SKILL.md",
    "quote": "DO NOT proceed with any generation task until the user explicitly confirms the parameters.",
    "scope": "本次陶器三镜的模型、规格、时长与预计费用；不继承旧书的具体费用批准。"
  },
  "referenceManifest": "app/production/tea-video-reference-prompts.json",
  "implementationChoices": [
    "保留原15秒三镜与情绪走向，原设计字节不改写。",
    "沿用生成参考中人物偏右的实际构图，替代原稿偏左，保证本轮视觉方向一致。",
    "第二镜从已经端杯的步态开始，省略抬杯，仍以两步与停稳为动作目标；停步图只作姿态参考，不固定相机终点。",
    "第三镜采用窗边近景与宽景作为首尾构图约束；真实后拉而非变焦仍需看片检查。",
    "触杯两次首尾帧提交无任务ID；用户另行确认以两图普通参考模式和简化文字进行第三次提交，模型与规格不变。原两次输入与失败记录独立归档。"
  ],
  "shots": [
    {
      "type": "i2v",
      "model": "Seedance 2.0",
      "resolution": 1080,
      "aspectRatio": "16:9",
      "nativeAudio": true,
      "count": 1,
      "generationDuration": 5,
      "editDuration": 5,
      "estimatedCredits": 120,
      "inputMode": "omni_reference",
      "referenceImages": [
        "assets/generated/tea-moment/video-reference/tea-1-before.png",
        "assets/generated/tea-moment/tea-1-touch.png"
      ],
      "referenceHashes": {
        "assets/generated/tea-moment/video-reference/tea-1-before.png": "3b936b48329f3d551bae2c49b3c64d780465fb908d2a1b96435f37dc18c8bd78",
        "assets/generated/tea-moment/tea-1-touch.png": "9f6a3e1bb445d096d1ddad1844be674b2381d3915973a195a8a35f97ec5e2b9b"
      },
      "referenceRole": "图1接触前、图2接触后，仅作对象与动作状态参考，不锁定首尾帧",
      "prompt": "5-second 16:9 realistic close-detail shot. Use image 1 for the initial cup and right-hand arrangement and image 2 for the final gentle contact pose. One speckled ivory ceramic cup rests flat in the same place on the wooden table. Its handle is on the right, with one small blue dot at the lower handle join. A single right hand in a dark-gray knitted sleeve begins with a small gap between fingertips and handle. After a brief pause, the thumb and index fingertip move a short distance to gently touch the top of the handle, then rest there for the remaining time. The cup remains on the table throughout, tea level steady. The camera and focus stay fixed; show the hand contact and cup base clearly. Preserve the same cup, tabletop, daylight from the left, natural skin and ceramic texture. A small ordinary touch followed by an unhurried pause. Continuous quiet room tone with a soft ceramic contact and fabric sound. Keep the scene free of text and music.",
      "promptZhTranslation": "5 秒、16:9 的写实细节近景。图 1 用于开始时杯子和右手的布局，图 2 用于最后轻触的姿态。一只米白斑点陶杯平放在木桌同一位置；把手在右，下连接处有一个蓝点。唯一一只穿深灰针织袖的右手，开始时指尖与杯柄之间留有小空隙。短暂停顿后，拇指与食指指尖小幅移动，轻轻触到把手上部，然后保持到结束。杯子全程落在桌面，茶水保持水平。摄影机和焦点固定，看清手部接触与杯底。保留同一杯子、桌面、左侧日光、自然皮肤与陶面质感。一个日常小动作，随后不匆忙地停留。连续安静室内底噪，配以轻触陶杯和衣料声。画面没有文字，声音没有音乐。",
      "promptZhTranslationOfSha256": "18a5b22900dd421bf1f2737c49f9e87c7683ec10df98d577876b1fa9f0677fe9",
      "id": "tea-1",
      "executionId": "tea-1-r3",
      "title": "触到日常",
      "submittedLanguage": "en",
      "refIds": [
        "lenses-macro"
      ],
      "plannedCheck": [
        "先检查接触点、手指数量、杯足落桌，再检查轻触后的停顿是否可读。"
      ],
      "referenceDisplay": [
        {
          "label": "参考图 1",
          "url": "https://github.com/yydshly/1021_codex_project/releases/download/melies-media-20261022/tea-moment--video-reference--tea-1-before.png"
        },
        {
          "label": "参考图 2",
          "url": "https://github.com/yydshly/1021_codex_project/releases/download/melies-media-20261022/tea-moment--tea-1-touch.png"
        }
      ]
    },
    {
      "id": "tea-2",
      "title": "走向窗边",
      "type": "i2v",
      "model": "Seedance 2.0",
      "resolution": 1080,
      "aspectRatio": "16:9",
      "nativeAudio": true,
      "count": 1,
      "submittedLanguage": "en",
      "generationDuration": 5,
      "editDuration": 5,
      "estimatedCredits": 120,
      "prompt": "5 seconds, 16:9. Image 1 is the same person, cup, room and rear-follow composition reference at the beginning of a carrying stride. Image 2 supplies ONLY the relaxed stopped posture and both-feet-planted state; do NOT lock its background camera position or morph the entire picture into it. Keep the same short-haired adult in dark-gray knit, dark trousers and dark slippers, back to camera with no visible face. The right hand holds the same cup HANDLE continuously, left palm supports the BASE from below, cup upright in front of lower chest, tea not spilling. Continue for TWO short natural steps toward the same window over roughly the first three seconds, then settle with both feet planted and pause for the final two seconds. Stop before the wall/window at a comfortable distance. No drinking, lifting cup to face, backward steps, turning to camera, extra gesture, sliding feet or duplicate cup. Follow smoothly from behind at a gentle rear-three-quarter angle, advancing in the person's direction at roughly matching speed, then stop the camera when the person stops. Keep the person screen right and at roughly constant readable size; show legs and ground contacts where possible. The window remains ahead/left, the worn wooden table stays left, and cabinet stays right. Preserve real perspective change and foreground parallax as the camera advances: no zoom, orbit, room mirroring, object drift or moving the window to fake travel. Keep the same daylight, knit and ivory glaze; no dramatic grading or hurried pursuit. Let a clear destination and an unforced stop express the choice to take a moment. One continuous shot, no cut, generated text, logo, tears or exaggerated acting. Soft footsteps, fabric rustle and continuous quiet room tone only; no speech or music.",
      "promptZhTranslation": "5 秒，16:9。图 1 是同一人物、杯子、房间与端杯步态开始时的后方构图参考。图 2 只提供放松停步和双脚落地的姿态，不锁定它的背景机位，也不把整幅图变形过渡到该图。保持同一短发成人、深灰针织衣、深色裤子与拖鞋，背向镜头不露脸。右手持续握同一杯柄，左掌从下托住杯底；杯子直立放在身体前方下胸位置，茶水不洒。约前三秒继续朝同一扇窗自然走两个短步，然后双脚落地站稳，最后两秒停留。在窗／墙前的舒适距离停住。不喝茶、不举杯到脸前、不倒退、不转身看镜头、不加手势、不滑步、不增加杯子。摄影机从轻微后方三分之四角度平稳跟随，大致匹配人物速度向前，在人物停步时也停下。人物保持画面偏右和大致稳定的可辨大小，尽量看清腿与脚接地。窗户仍在前方／左侧，旧木桌在左，柜子在右。摄影机前进应有真实透视和前景视差，不变焦、环绕、镜像房间、漂移物体或移动窗户来假装行走。延续日光、针织和米白陶面，不加戏剧调色或追逐感。让明确目的地和自然停步表达主动留出片刻的选择。单一连续镜头，不切镜、不生成文字或标志，不哭泣或夸张表演。只有轻脚步、衣料声和连续安静室内底噪，无人声和音乐。",
      "referenceImages": [
        "assets/generated/tea-moment/tea-2-walk.png",
        "assets/generated/tea-moment/video-reference/tea-2-stop.png"
      ],
      "inputMode": "omni_reference",
      "referenceRole": "图1人物／杯子／场景与步态构图，图2仅为停步姿态；不锁定图2背景机位",
      "referenceHashes": {
        "assets/generated/tea-moment/tea-2-walk.png": "37ba2ac6b844673b5080a583833d201cc60b0aebfb4377d3eca2a69d899d1b1a",
        "assets/generated/tea-moment/video-reference/tea-2-stop.png": "5b7ea5b1cf372652229e325b8598029047a0fe0cbc3ad931d49e0570def8377f"
      },
      "refIds": [
        "camera-movement-follow"
      ],
      "plannedCheck": [
        "完整检查两步、脚底接地、杯子双手支撑与停稳；区分摄影机真实跟随与固定机位下人物远去。"
      ],
      "promptZhTranslationOfSha256": "ef01f0f7240ed0cf0e23af079b42f91689ef6e93e3859cf0fadca6fa5fe0cfd2",
      "referenceDisplay": [
        {
          "label": "参考图 1",
          "url": "https://github.com/yydshly/1021_codex_project/releases/download/melies-media-20261022/tea-moment--tea-2-walk.png"
        },
        {
          "label": "参考图 2",
          "url": "https://github.com/yydshly/1021_codex_project/releases/download/melies-media-20261022/tea-moment--video-reference--tea-2-stop.png"
        }
      ]
    },
    {
      "id": "tea-3",
      "title": "留住片刻",
      "type": "i2v",
      "model": "Seedance 2.0",
      "resolution": 1080,
      "aspectRatio": "16:9",
      "nativeAudio": true,
      "count": 1,
      "submittedLanguage": "en",
      "generationDuration": 5,
      "editDuration": 5,
      "estimatedCredits": 120,
      "prompt": "5 seconds, 16:9. Use the supplied close window-pause image as the FIRST FRAME and wider room view as the END FRAME. The same person has ALREADY STOPPED at the window. Keep that person and the single speckled ivory cup stationary in the room for the entire shot, with only subtle natural breathing. Right hand stays on the handle and left palm supports the base; the tea stays level. Keep the one blue dot at the lower handle attachment; if the grip hides it, leave it hidden instead of inventing a mark on the cup front. NO additional steps, drinking, cup raising, head turn, slumping or new gesture. Move ONLY the CAMERA backward on a smooth dolly at a FIXED FOCAL LENGTH during roughly seconds 0–3, revealing more of the same window corner, wooden table at foreground left, floor and cabinet at right. Then LOCK the camera and hold the wider view for roughly seconds 3–5. Preserve coherent perspective/parallax and room geography; do not zoom, orbit, warp furniture, shrink the person's body in place or move the window to imitate a dolly. Keep a readable human presence, relaxed upright body and ordinary lived-in room rather than an isolated tiny silhouette. Maintain the same window daylight and exterior green leaves, with restrained texture and detail in interior shadows. This chosen pause and the held final view should support quiet personal time, without asking for sad acting. One continuous shot, no cuts, fake text, logo, magical particles or new objects. Continuous quiet room tone and slight clothing sound only, no speech or music. Do not generate a title or fade; those are added in editing if needed.",
      "promptZhTranslation": "5 秒，16:9。所给窗边停留近景为首帧，较宽房间画面为尾帧。同一人物已经在窗前停稳，全镜中人物与同一只米白斑点陶杯在房间里保持不动，只保留自然细微呼吸。右手持续持柄，左掌托底，茶水保持水平。把手下连接处只有一个蓝点；被手遮住就自然遮挡，不在杯身正面凭空补标记。不再走步、喝茶、举杯、转头、垂头或加手势。约 0–3 秒只让摄影机以固定焦距平稳后退，逐步露出同一窗边、左前景木桌、地板和右侧柜子；约 3–5 秒机位固定，保持宽景。维持连贯的透视、视差和房间方位，不变焦、环绕、扭曲家具、让人物原地缩小或移动窗户来假装后拉。人物仍清楚可辨、姿态放松直立，房间仍有日常生活感，不缩成孤立的小剪影。延续窗户日光与窗外绿叶，质感克制，室内暗部保留细节。通过主动停留与最终保持的画面，表达属于自己的安静时间，不要求悲伤表演。单一连续镜头，不切镜，不加假文字、标志、魔法粒子或新物体。只有连续安静室内底噪和少量衣料声，无人声和音乐。不要生成片名或淡出，需要时在后期完成。",
      "firstFrame": "assets/generated/tea-moment/source/room-and-person-reference.png",
      "endFrame": "assets/generated/tea-moment/tea-3-pause.png",
      "inputMode": "first_last_frames",
      "referenceRole": "窗边近景→房间宽景构图；主体停留，只有摄影机后退",
      "referenceHashes": {
        "firstFrame": "691b3bb3e0baf212b49aa15657a15f325373e8f884ef917eb71249e9bad63dbb",
        "endFrame": "4f4c26a11ca125ade5c1b4c61304916a7ea9f08cbf189727107e5d184a13bc4a"
      },
      "refIds": [
        "camera-movement-dolly-out"
      ],
      "plannedCheck": [
        "核对人物始终不走动、空间不变形、摄影机真实后退，并观察后段是否实际停住。"
      ],
      "promptZhTranslationOfSha256": "023ee2d6d150780614c3ea56389a9e549efa7de596826a7b648c9669f821f14a",
      "referenceDisplay": [
        {
          "label": "首帧",
          "url": "https://github.com/yydshly/1021_codex_project/releases/download/melies-media-20261022/tea-moment--source--room-and-person-reference.png"
        },
        {
          "label": "尾帧",
          "url": "https://github.com/yydshly/1021_codex_project/releases/download/melies-media-20261022/tea-moment--tea-3-pause.png"
        }
      ]
    }
  ],
  "assembly": {
    "duration": 15,
    "shotOrder": [
      "tea-1",
      "tea-2",
      "tea-3"
    ],
    "editDurations": [
      5,
      5,
      5
    ],
    "transitions": "两处硬切；末尾约0.3秒轻淡出。实际剪辑范围待原片测量与审片后记录，不自动掩盖错误。",
    "title": "不让视频模型生成文字；如需片名，在实际构图检查后于后期添加。",
    "audio": "保留原生环境和动作声，逐镜听评与接缝处理另记；未听到前不宣称音效达标。"
  },
  "reviewPlan": {
    "action": [
      "杯子数量、指尖接触位置与杯底落桌",
      "两步的脚底接触、双手支撑、持杯朝向与停稳",
      "停步后不再走动，人物／杯子／房间与前镜连续"
    ],
    "expression": [
      "逐镜观察轻触和停顿、跟随与目的地、后拉后留出时间是否实现",
      "分别记录模型的视觉判断、声音是否听评、用户实际感受及另一种可能解读",
      "完整观看一次成片并复核关键中间帧；不把柔光或暖木色等同于安静命中"
    ],
    "reuse": [
      "保留原设计、准确提交英文和对应中文译文、参考角色、原片、剪辑范围与证据时间",
      "将已观察到的经验、未证明的原因猜测和候选改法分开",
      "一次方案执行作为一个题材样本，不把三镜当成三次独立验证"
    ],
    "audienceFeedback": null
  },
  "noAutomaticRetry": true,
  "executionNotes": {
    "tea-1": "两次首尾帧提交无任务ID，按单独确认改两图参考模式与简化文字后，1035321完成。不能从两项同时变化确定原错误原因。",
    "tea-2": "1035300 已提交",
    "tea-3": "1035299完成；首轮超时后恢复同一任务查询，无重新提交。"
  },
  "retryApproval": {
    "tea-1": {
      "confirmed": true,
      "confirmedAt": "2026-10-22T09:17:02.403141+00:00",
      "userResponse": "确认，只重试触杯这一镜一次",
      "sameParameters": true,
      "afterOtherShotsComplete": true,
      "estimatedCredits": 120,
      "historicalServiceCostReference": 150,
      "failedSubmissionDeductionVerified": false,
      "consumed": true
    }
  },
  "recoveryApproval": {
    "confirmedAt": "2026-10-22T09:35:31.038508+00:00",
    "userResponse": "确认，按参考图模式再尝试一次触杯",
    "promptSha256": "18a5b22900dd421bf1f2737c49f9e87c7683ec10df98d577876b1fa9f0677fe9",
    "singleAttemptOnly": true
  },
  "recoveryRecord": "app/production/tea-touch-recovery-r3.json",
  "serviceReportedCredits": 450.0,
  "completedAt": "2026-10-22T09:44:07.062153+00:00",
  "designSnapshot": {
    "schemaVersion": 2,
    "kind": "emotion_action_direction",
    "brief": {
      "goal": "为手作陶器品牌设计一支日常短片：从杯子的触感，走到人在窗边为自己停留的片刻。",
      "subject": "一只带蓝色小点的米白陶瓷杯，以及端杯走向窗边的人",
      "audience": "喜欢手作器物、希望在日常中留出片刻的人",
      "feeling": "日常的安静逐步加深，结尾有愿意为自己停留片刻的感受。",
      "avoidFeeling": "忧伤、孤独、奢侈品陈列或刻意煽情。",
      "setting": "同一间有木桌和窗户的普通茶室，白天左侧柔和窗光；人物穿深灰针织衣，背向镜头，不拍脸。",
      "assets": "尚无本题材身份图或动作参考；生成前另做同一杯子与人物的参考。",
      "duration": 15,
      "aspectRatio": "16:9",
      "shotCount": 3
    },
    "title": {
      "zh": "把片刻，留给自己",
      "en": "Keep a Moment for Yourself"
    },
    "concept": {
      "zh": "从一个可触摸的细节，跟随端杯的行动来到窗边，再让空间展开，把主动停留留作余味。",
      "en": "Begin with a tactile detail, follow the cup-bearer to the window, then reveal the room and hold on the choice to pause."
    },
    "emotion": {
      "viewerExperience": "让日常器物与主动停步的行动支持安静、愿意停留的预期感受。",
      "progression": "deepen",
      "opening": "注意到一件平常但可感知的器物。",
      "event": "人物端杯走向窗边并停下。",
      "ending": "在安静空间里留住片刻。",
      "contextReason": "杯子伴随人的日常行动；主动停止行走、稳定托杯和留出停顿，让片刻具有被选择的意义。光色与慢节奏只是配合，这些感受仍需观看反馈。"
    },
    "anchor": {
      "zh": "同一只米白陶瓷杯，略带细小斑点，杯柄根部有一个蓝色小点，杯中茶水不满。人物一直穿深灰针织衣，背向镜头，不露脸。普通木桌与同一扇窗，左侧柔和白天窗光，窗外只有静止绿意。",
      "en": "The same speckled ivory ceramic cup has one small blue dot at the handle base and is partly filled with tea. The person wears the same dark-gray knit top, remains back to camera, and shows no face. Keep the ordinary wooden table and same window, soft daylight from the left, and still greenery outside."
    },
    "constraints": {
      "zh": "保持一杯一人、杯柄和蓝点一致，手与杯子的支撑关系合理，茶水不洒。不加哭泣、夸张表演、漂浮物、品牌字或奢侈品展台。",
      "en": "Keep one cup and one person, consistent handle and blue dot, plausible hand support, and no spilled tea. No crying, exaggerated acting, floating objects, brand lettering or luxury display pedestal."
    },
    "provenance": {
      "mode": "assistant_authored",
      "mediaStatus": "design_only",
      "modelVersion": null,
      "referenceCaseIds": [
        "book-repair",
        "rain-to-forest"
      ],
      "reusedLogic": "参考旧书的手与道具接触、身份与构图分别检查，以及香水从细节到更大空间的表达组织。",
      "newDesign": "陶瓷杯、端杯前行、在窗边主动停步和后拉揭示空间，均为本次新设计；引用跟拍和后拉，验证全库引用流程。",
      "evidence": "依据相关条目原文与已有案例文字复盘设计，本轮未重新观看原站视频，未生成本题材视频，也无观众反馈。不继承案例验证状态。"
    },
    "shots": [
      {
        "id": "tea-1",
        "title": "触到日常",
        "duration": 5,
        "emotionalBeat": {
          "intent": "把注意力放到可触摸的日常细节。",
          "visibleCause": "手指接触杯柄后停住，杯子仍在桌面。",
          "why": "谨慎且明确的接触让人与器物的关系可见，为后续端杯行动建立依据。",
          "alternativeReading": "过度磨皮、强高光或手指摆拍可能读成昂贵商品陈列，削弱日常感。"
        },
        "direction": {
          "zh": "通过真实陶面与一次轻触建立可感知的日常，不夸张表演；接触后给观众时间观察。",
          "en": "Establish tangible everyday life through the ceramic surface and one light touch, with restrained performance and time to observe after contact."
        },
        "action": {
          "before": {
            "zh": "杯子平放在木桌上，杯柄朝右，右手尚未碰到杯柄。",
            "en": "The cup rests on the wooden table, handle to the right, with the right hand not yet touching it."
          },
          "performance": {
            "zh": "右手拇指和食指轻轻接触同一杯柄，保持杯子在桌面，然后停住。",
            "en": "The right thumb and forefinger gently contact the same handle, keeping the cup on the table, then pause."
          },
          "after": {
            "zh": "手指留在杯柄，杯子的位置和朝向不变。",
            "en": "The fingers remain on the handle; the cup position and orientation stay unchanged."
          },
          "relations": {
            "zh": "只有一只杯子和一只可见右手，指尖贴在杯柄表面，不穿透杯柄，杯底保持接触木桌。",
            "en": "Show one cup and one visible right hand. Fingertips meet the handle surface without penetrating it; the base remains on the table."
          }
        },
        "expression": {
          "camera": {
            "zh": "固定近距离细节机位，杯柄根部与手指接触点清楚，保持足够景深。",
            "en": "Locked close detail view with enough depth of field to keep the handle base and finger contact clear."
          },
          "composition": {
            "zh": "杯柄和蓝点在中部，桌面保留少量使用痕迹，远处背景自然虚化。",
            "en": "Place the handle and blue dot near center, retain minor signs of use on the table, and let the distant background soften."
          },
          "lighting": {
            "zh": "左侧窗户柔和漫射光，陶面有层次，不做夸张亮斑。",
            "en": "Soft diffuse window light from the left models the ceramic without exaggerated highlights."
          },
          "timing": {
            "zh": "前一秒静置，约一至三秒完成轻触，随后停留，不做慢动作重放。",
            "en": "Hold still for the first second, make the light contact around seconds one to three, then hold; no slow-motion replay."
          },
          "sound": {
            "zh": "只计划轻微衣料声、指尖触杯声与自然室内底噪，无配乐和旁白。",
            "en": "Plan only soft clothing, fingertip-to-cup contact and natural room tone, without music or narration."
          }
        },
        "references": [
          {
            "id": "lenses-macro",
            "purpose": "让细节与接触清楚可见。",
            "retain": "明确细节尺度和清晰接触区。",
            "adapt": "将原例的机械细节替换为杯柄、蓝点与手指；景深按本次接触可读性调整。"
          }
        ],
        "referencePlan": "生成前准备杯子身份图和手指尚未接触／已接触的起止参考；当前尚未提供。",
        "transition": {
          "zh": "接触后的停顿处硬切；下一镜已经端起同一杯子，省略抬杯过程并保持右手持柄。",
          "en": "Hard-cut during the contact pause. The next shot starts with the same cup already lifted, preserving the right-hand grip and omitting the lift."
        },
        "checks": {
          "action": [
            "一杯一手，手指与杯柄接触位置稳定，杯底不漂浮。"
          ],
          "expression": [
            "轻触与停顿可读；记录观看者是否感到日常亲近，不能只凭柔光认定情绪达标。"
          ]
        }
      },
      {
        "id": "tea-2",
        "title": "走向窗边",
        "duration": 5,
        "emotionalBeat": {
          "intent": "让观众陪伴一个明确而平常的行动。",
          "visibleCause": "人物端杯走向窗户，抵达后停止脚步。",
          "why": "行动有可见目的地，停止行走使接下来的停留具有主动选择的依据。",
          "alternativeReading": "行走过快、跟拍晃动过强或路程不清可能读成赶路与不安。"
        },
        "direction": {
          "zh": "通过陪伴式行走与清楚的停步，把注意力从杯子带到人的日常选择。",
          "en": "Bring attention from the cup to an everyday choice through an accompanying walk and a clearly readable stop."
        },
        "action": {
          "before": {
            "zh": "同一人物背向镜头，右手持杯柄，左手托杯底，站在木桌旁，窗户在前方。",
            "en": "The same person stands beside the wooden table, back to camera, right hand on the handle and left hand supporting the base, with the window ahead."
          },
          "performance": {
            "zh": "人物稳定端杯向窗户走两步，抵达后自然停住；杯子始终在身体前方。",
            "en": "The person carries the cup steadily for two steps toward the window and naturally stops, keeping it in front of the body."
          },
          "after": {
            "zh": "人物背向镜头站在窗前，双手继续稳住同一杯子。",
            "en": "The person stands at the window, back to camera, with both hands still supporting the same cup."
          },
          "relations": {
            "zh": "同一右手持同一杯柄、左手托底，双脚交替接地；人物、窗户和桌子的空间顺序持续一致。",
            "en": "The same right hand holds the same handle and the left supports the base. Feet alternate contact with the floor; the person, window and table maintain consistent spatial order."
          }
        },
        "expression": {
          "camera": {
            "zh": "摄影机从人物后方同步跟随，距离大致稳定，不同时变焦或环绕；停步时摄影机也平稳停下。",
            "en": "Follow behind the person at roughly constant distance, without added zoom or orbit; settle smoothly when the person stops."
          },
          "composition": {
            "zh": "背影居中略偏左，杯子部分可见，前方窗户始终提供目的地方向。",
            "en": "Keep the back slightly left of center, the cup partly visible, and the window ahead as a continuous destination cue."
          },
          "lighting": {
            "zh": "延续同一左侧窗光，走近窗户时亮度自然变化，深灰针织衣保持细节。",
            "en": "Continue the same left window light, allowing natural brightness change near the window while retaining knit texture."
          },
          "timing": {
            "zh": "约前三秒走两步，后二秒停住；步伐自然，不用突然加速。",
            "en": "Take two natural steps over roughly the first three seconds and pause for the last two, without sudden acceleration."
          },
          "sound": {
            "zh": "计划轻脚步、衣料声与连续室内底噪；不加入催促性节拍。",
            "en": "Plan soft footsteps, fabric and continuous room tone, without an insistent beat."
          }
        },
        "references": [
          {
            "id": "camera-movement-follow",
            "purpose": "陪伴人物穿行空间并保持方向。",
            "retain": "后方同步跟随主体。",
            "adapt": "换成端杯走向同一茶室窗户的人，加入停步与摄影机同步停下。"
          }
        ],
        "referencePlan": "准备同一人物、杯子及桌子到窗户的空间参考，手的支撑关系明确；当前尚未提供。",
        "transition": {
          "zh": "人物停步后硬切到同一窗前位置的杯子与背影近景，持杯姿态不变。",
          "en": "After the stop, hard-cut to a closer view of the cup and back at the same window position, preserving the grip."
        },
        "checks": {
          "action": [
            "双脚接地与双手支撑合理，茶水不洒，窗户不换边。"
          ],
          "expression": [
            "停步清楚，后方跟随不读成追逐；脚步声音需生成后实际听评。"
          ]
        }
      },
      {
        "id": "tea-3",
        "title": "留住片刻",
        "duration": 5,
        "emotionalBeat": {
          "intent": "加深主动停留的余味。",
          "visibleCause": "人物已经停止行走，双手稳住杯子，空间展开后仍留有停顿。",
          "why": "人物安稳处于可辨的日常环境中，持续停留让这段时间具有被保留的意味。",
          "alternativeReading": "空房过冷、人物被放得过远或停留过长，可能读成孤独与疏离。"
        },
        "direction": {
          "zh": "让已停步的人与日常空间共同承担安静的余味，保留人的在场感。",
          "en": "Let the paused person and ordinary room support a quiet aftertaste while retaining a clear sense of human presence."
        },
        "action": {
          "before": {
            "zh": "人物仍在同一窗前，双手持同一杯子，背向镜头，身体已停止移动。",
            "en": "The person remains at the same window, holding the same cup in both hands, back to camera and already still."
          },
          "performance": {
            "zh": "人物保持稳定托杯，只允许自然细微呼吸，整个镜头不再走动或额外摆姿势。",
            "en": "Maintain the supported cup with only subtle natural breathing, without further walking or extra posing."
          },
          "after": {
            "zh": "人物与杯子仍留在同一窗前，环境已被看见，动作状态保持。",
            "en": "The person and cup remain at the same window as the room has been revealed, with the held state unchanged."
          },
          "relations": {
            "zh": "一人一杯保持身份和支撑关系，窗户与木桌的方位承接上一镜，摄影机后退不带动物体漂移。",
            "en": "Maintain one person and one cup, consistent identity and support, and the previous window/table layout. Camera retreat must not make objects drift."
          }
        },
        "expression": {
          "camera": {
            "zh": "从杯子与背影的近景缓慢向后拉轨，焦距保持固定，约前三秒揭示窗边与木桌，随后机位停住。",
            "en": "Dolly backward slowly from a close view of the cup and back at a fixed focal length, revealing the window corner and table over roughly three seconds, then hold the camera still."
          },
          "composition": {
            "zh": "人物仍清楚可辨，普通茶室逐渐进入画面，保留适量空间而不让人缩成孤点。",
            "en": "Keep the person clearly readable as the ordinary tea room enters frame, allowing space without reducing the figure to an isolated speck."
          },
          "lighting": {
            "zh": "延续同一柔和左侧窗光，室内暗部保留层次，窗外绿意不过曝。",
            "en": "Continue the same soft left window light, preserving interior shadow detail and exterior greenery."
          },
          "timing": {
            "zh": "约三秒后停止拉轨，留两秒静止余味，末尾后期轻淡出。",
            "en": "Finish the dolly around three seconds, hold for a two-second aftertaste, and add a gentle ending fade in post."
          },
          "sound": {
            "zh": "计划保留连续室内底噪，动作声减少后仍有空间感，片尾自然收声。",
            "en": "Plan continuous room tone that retains a sense of space after action sounds diminish, with a natural audio ending."
          }
        },
        "references": [
          {
            "id": "camera-movement-dolly-out",
            "purpose": "从局部揭示环境，并给停留提供空间。",
            "retain": "固定焦距后退，逐渐带入更大环境。",
            "adapt": "将原例的钢琴与舞厅改成端杯的人与同一茶室，结尾停止拉轨并停留。"
          }
        ],
        "referencePlan": "准备与上一镜一致的近景起始和茶室宽景空间参考，确认同一窗与桌子位置；当前尚未提供。",
        "transition": {
          "zh": "最后两秒保持画面，后期淡出；片名如需添加另行选择实际空位。",
          "en": "Hold the final two seconds and fade in post. If a title is needed, choose an actual clear area after reviewing the footage."
        },
        "checks": {
          "action": [
            "人、杯和房间不随后拉变形，持杯姿态与上一镜一致。"
          ],
          "expression": [
            "人物仍有在场感；用观看反馈判断安静或孤独的实际解读，不用镜头名称代替感受判断。"
          ]
        }
      }
    ]
  },
  "recordUrl": "tea-moment-plan.json"
};
