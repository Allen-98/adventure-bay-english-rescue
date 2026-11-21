# 冒险湾英文救援队

适合亲子陪玩的英语救援小游戏。孩子接听电台、听辨字母和词汇，最后把消息组合成句子，指挥队员接乘客。[进入冒险湾码头](https://zhaocai7.cn/games/english-rescue/)

## 学习路线

0.3.0 共有 30 关。新玩家从 A/B 开始，每完成一关，下一关才开放。从「全部任务」能按主题查看路线，重玩已完成的关卡。

| 顺序 | 任务 |
|---|---|
| 1–13 | 从 A/B 到 Y/Z，每组先认两个字母，再交换浮台位置，听英语分别接回乘客。 |
| 14–18 | 红蓝引航和信号旗学习 red、blue、yellow、green、purple、pink、orange、white。换成救生圈复习全部八种颜色。 |
| 19–23 | 到果园给野餐船备货，每关认识两种水果：apple、banana、orange、pear、grape、strawberry、peach、watermelon。最后听客人点单装篮。 |
| 24–27 | 小兔米米介绍自己的 mom、dad、sister、brother、grandma、grandpa。在米米家，sister 是妹妹，brother 是哥哥；这两个英文词本身都不区分长幼。最后听米米的请求给六位家人送礼物。 |
| 28–29 | 乘客报到和寻找停靠点，学习 duck/cat、boat/dock。 |
| 30 | 给天天发电报，选择动物和地点，发出完整消息，再放下踏板接乘客。 |

进度保存在当前浏览器。0.2.0 已完成的字母和红蓝引航继续有效；在新路线中补齐新增的词汇任务后，会自动接回原已完成的乘客、地点和组句任务。0.1.0 的 A/B 同样可接续到 C/D。

## 运行

直接用浏览器打开 `dist/开始救援.html` 可离线游玩。开发环境运行 `pnpm install --frozen-lockfile`、`pnpm dev`，构建命令为 `pnpm run build`。发布网页使用 `dist/index.html` 及同目录的 `assets`、`art` 和 `audio`。

`main` 保存 0.1.0 三关自由试玩版，顺序课程在 `update` 分支开发。
