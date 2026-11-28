# 冒险湾英文救援队

适合亲子陪玩的英语救援小游戏。孩子可以帮小砾修桥、在果园给乘客备货，也可以帮天天拍照，用英语告诉她镜头里有谁。[进入冒险湾码头](https://zhaocai7.cn/games/english-rescue/)

## 学习路线

0.4.0 共有 32 关。字母、单词和句子三个项目从第一次游玩起就可以自由选择。在同一项目里，每完成一关，就开放下一关。首页上的项目卡会接着上次的进度走，「救援手册」可以查看后面的故事，也可以重玩已经完成的任务。

| 项目 | 任务 |
|---|---|
| 字母 · 13 关 | 每关两个字母。从 A/B 到 Y/Z，依次修桥、在果箱里捉迷藏、转雾灯、接火车、踩冰河、投信、敲回声鼓、收气球水果、用钥匙开门、泵水浇花、开升降机、擦霜窗、连星座。 |
| 单词 · 前 5 关 | 给小船引航、升旗、放风筝、点信号灯，再抛救生圈，听辨 red、blue、yellow、green、purple、pink、orange、white。 |
| 单词 · 第 6–10 关 | 摘水果、上秤、榨汁、装保冷箱、听客人点单，认识 apple、banana、orange、pear、grape、strawberry、peach、watermelon。 |
| 单词 · 第 11–14 关 | 听小兔米米介绍 mom、dad、sister、brother、grandma、grandpa，再拍照片、送礼物、递船票、请家人入座。在米米家，sister 是妹妹，brother 是哥哥。这两个英文词都不区分长幼。 |
| 单词 · 第 15–16 关 | 帮乘客报到和寻找停靠点，听懂 duck、cat、boat、dock。 |
| 句子 · 3 关 | 用 **I see a duck.** 或 **I see a cat.** 给天天报信，用 **I like apples.** 或 **I like bananas.** 替自己点野餐，最后组合动物和地点，发出 **The cat is on the dock.** 等整句，指挥队员接乘客。 |

进度保存在当前浏览器。已有存档会自动迁移。旧字母关的通过次数继续有效，可以从手册重玩对应的新故事。旧版已完成的后续任务会在补齐本项目新增的前置关后恢复成绩。

## 运行

直接用浏览器打开 `dist/开始救援.html` 可离线游玩。开发环境运行 `pnpm install --frozen-lockfile`、`pnpm dev`，构建命令为 `pnpm run build`。发布网页使用 `dist/index.html` 及同目录的 `assets`、`art` 和 `audio`。

`main` 保存 0.1.0 初版，当前课程在 `update` 分支开发。进度与迁移回归测试可用 `node --test` 运行。
