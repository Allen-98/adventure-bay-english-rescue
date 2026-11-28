// The same keys drive the recorded lines and the device-voice recovery path.
const lines = {
  intro: '队长，冒险湾来电话啦！点一张任务卡，看看谁需要帮助。',
  dispatchLetters: '浮台起雾了，两只鸭宝宝等着回家。队长，跟路马一起去开灯吧！',
  dispatchPassengers: '小鸭和小猫都在等船，先听听它们的英文名字，再帮乘客报到。',
  dispatchPlaces: '来给路马认认路。听英语，找到小船和码头。',
  dispatchColors: '两艘小船回到港口啦。队长，听听船长的话，帮他们靠岸吧！',
  dispatchRadio: '天天在空中看不清小动物。队长，用对讲机告诉她，先接谁吧！',
  dispatchSpotter: '天天想拍两张动物照。队长，告诉她，你看见了谁？',
  dispatchPicnic: '野餐开始啦！队长，告诉路马你喜欢什么水果吧。',
  spotterHelp: '看看镜头里的小动物。点一下它，告诉天天看见了谁。',
  picnicHelp: '先听听两种水果，再告诉路马你喜欢哪一种。',
  sayTogether: '点一下亮起来的对讲机，把整句话发出去吧。',
  seeFrame: 'I see',
  aDuck: 'a duck',
  aCat: 'a cat',
  seeDuck: 'I see a duck.',
  seeCat: 'I see a cat.',
  likeFrame: 'I like',
  apples: 'apples',
  bananas: 'bananas',
  likeApples: 'I like apples.',
  likeBananas: 'I like bananas.',
  routeColor: '引航旗需要颜色，来帮路马找到指定的旗子。',
  routeFruit: '小船要出发啦，帮路马把客人要的水果装进野餐篮。',
  routeFamily: '我是小兔米米。我想把礼物送给家人，来听我介绍他们吧。',
  reviewColor: '码头要开船啦！帮路马再认一认这些颜色。',
  reviewFruit: '野餐时间到啦！听听客人想吃什么水果。',
  reviewFamily: '我是米米。家人们都来啦，这次来帮我送礼物吧！',
  familyTouch: '点一点相册，听米米介绍两位家人。',
  fruitTouch: '点一点水果，听听它叫什么。',
  colorTouch: '点一点旗子，听听它是什么颜色。',
  familyOrder: '听米米说，礼物要交给谁。',
  reviewListen: '听电台，找到它就点一下。',
  wsFlag: '听颜色，选一面旗子，再拉绳子升旗。',
  wsKite: '听听是哪种颜色。选好风筝，点一下天天，让风筝飞起来。',
  wsLamp: '听颜色，按亮那盏灯，给小船照路。',
  wsRing: '路马来接救生圈啦！听颜色，点一下，抛给他。',
  wsTree: '听听要摘什么水果。摇一摇那根枝条，也可以点一下。',
  wsScale: '听水果的名字，把它放上秤，再轻轻按一下秤盘。',
  wsJuice: '听听要哪种水果。选好以后，按一下榨汁机。',
  wsCool: '听听要装什么水果。放进箱子，再合上盖子吧。',
  wsServe: '客人开始点菜啦！听听它要吃什么，点水果送给它。',
  wsPhoto: '听米米介绍家人。找到那位家人，再按相机拍张照片。',
  wsGift: '先拿起礼物，再听听要送给妹妹还是哥哥。',
  wsTicket: '谁要坐船啦？听米米的声音，把船票递给那位家人。',
  wsParty: '米米的家人来吃饭啦！听听它介绍了谁，点一下请他入座。',
  pullFlag: '来，拉一下旗绳。',
  flyKite: '点一下天天，放飞风筝。',
  pressScale: '按一下秤盘，看看指针。',
  pressBlender: '按一下榨汁机，榨出果汁。',
  closeCooler: '盖上箱子，水果就装好啦。',
  takePhoto: '点一下相机，拍张照片。',
  pickGift: '拿起礼物，米米会告诉你送给谁。',
  readyToHelp: '准备好啦！点亮起来的黄色按钮，出发吧。',
  welcomeBack: '队长，欢迎回到瞭望塔！',
  missionDone: '大家都平安到家了！谢谢你，队长！',
  letterIntro: '跟着路马开灯，接鸭宝宝回家。听听这个字母，再点浮台。',
  letterIntroAB: '小桥缺了两块木板。听字母，选一块木板，再点一下桥上的缺口。',
  letterIntroCD: '小动物躲进果箱啦！听字母，掀开那个果箱找找看。',
  letterIntroEF: '雾起来啦！听字母，点圆盘转动灯头。对准字母，再按开关。',
  letterIntroGH: '小火车缺了车厢！听听车头的字母，给它接上同一个字母的小写车厢。',
  letterIntroIJ: '河上结冰啦！听字母，踩上那一块冰，带狗狗一步步过河。',
  letterIntroKL: '小狗邮局开门啦！拿好信，听字母，点一下收信的邮箱。',
  letterIntroMN: '小乐队在等你！听完字母鼓，再照着刚才的顺序敲一敲。',
  letterIntroOP: '水果飞到天上啦！听字母，戳破那个气球，让水果落进篮子。',
  letterIntroQR: '小动物想出门啦！听字母，选一把钥匙，再点一下锁孔。',
  letterIntroST: '小花口渴啦！听字母，连点两下那台水泵，给花浇浇水。',
  letterIntroUV: '升降机来接人啦！听字母，按箭头，到那一层再点开门。',
  letterIntroWX: '窗上结霜啦！听字母，在那扇窗上擦一擦，也可以点两下。',
  letterIntroYZ: '来帮星星带路吧！听字母，找到它的星座，再点闪光的小星星。',
  letterExplore: '摸一摸这两个字母，听听它们的名字。',
  letterRequest: '听，要找哪个字母？',
  letterRetry: '再听一遍。你可以再试一次。',
  letterNextStar: '点闪光的小星星，把它们连起来。',
  letterBridgePlace: '点亮起来的缺口，放好木板。',
  letterKeyTurn: '把钥匙插进亮起来的锁孔。',
  letterEncore: '再来一次，听好前后两个字母。',
  letterPumpAgain: '再按一下水泵！',
  letterWindowAgain: '再擦一下！',
  cnPracticeLetter: '摸摸亮起的字母，听听它的名字。',
  cnTryLetter: '这次自己听一听，哪一个浮台？',
  vocabTouch: '先碰一碰两张图片，听听它们的英文。',
  vocabListen: '换个位置，听听说的是哪一个。',
  vocabRetry: '再听一遍，找到它就点一下。',
  letterListen: '还有一只小鸭，听听它在哪个浮台。',
  colorIntro: '摸摸两艘船，听听它们的颜色。',
  colorListen: '船长正等着靠岸，听听是哪艘船。',
  radioIntro: '鸭子和小猫在哪儿？点图块，告诉天天先接谁。',
  radioOrder: '先选动物，再说在哪里。',
  radioSend: '点黄色对讲机，把消息发给天天。',
  radioCheck: '天天到了，和镜头里的一样吗？再看看，可以换一个词。',
  checkLetter: '我们看看，这个浮台不是这次要去的。再听一次。',
  checkColor: '这艘船可以等等，再听听船长要什么颜色。',
  otherAnimal: '这位朋友已经上船啦，去接另一位吧。',
  arrived: '接到啦！按船铃，带朋友们回家。',
  board: '放下踏板，让小伙伴上船。',
  ...Object.fromEntries(Array.from('abcdefghijklmnopqrstuvwxyz', letter => [letter, 'Letter ' + letter.toUpperCase() + '.'])),
  red: 'Red.',
  blue: 'Blue.',
  wDuck: 'Duck.',
  wCat: 'Cat.',
  wBoat: 'Boat.',
  wDock: 'Dock.',
  wYellow: 'Yellow.',
  wGreen: 'Green.',
  wPurple: 'Purple.',
  wPink: 'Pink.',
  wOrange: 'Orange.',
  wWhite: 'White.',
  wApple: 'Apple.',
  wBanana: 'Banana.',
  wPear: 'Pear.',
  wGrape: 'Grape.',
  wStrawberry: 'Strawberry.',
  wPeach: 'Peach.',
  wWatermelon: 'Watermelon.',
  wMom: 'Mom.',
  wDad: 'Dad.',
  wSister: 'Sister.',
  wBrother: 'Brother.',
  wGrandma: 'Grandma.',
  wGrandpa: 'Grandpa.',
  familyMom: 'This is my mom.',
  familyDad: 'This is my dad.',
  familySister: 'This is my sister.',
  familyBrother: 'This is my brother.',
  familyGrandma: 'This is my grandma.',
  familyGrandpa: 'This is my grandpa.',
  familyCnMom: '这是我的妈妈。',
  familyCnDad: '这是我的爸爸。',
  familyCnSister: '这是我的妹妹。',
  familyCnBrother: '这是我的哥哥。',
  familyCnGrandma: '这是我的奶奶。',
  familyCnGrandpa: '这是我的爷爷。',
  giftMom: 'For my mom, please.',
  giftDad: 'For my dad, please.',
  giftSister: 'For my sister, please.',
  giftBrother: 'For my brother, please.',
  giftGrandma: 'For my grandma, please.',
  giftGrandpa: 'For my grandpa, please.',
  orderApple: 'An apple, please.',
  orderBanana: 'A banana, please.',
  orderOrange: 'An orange, please.',
  orderPear: 'A pear, please.',
  orderGrape: 'Some grapes, please.',
  orderStrawberry: 'Some strawberries, please.',
  orderPeach: 'A peach, please.',
  orderWatermelon: 'Watermelon, please.',
  redBoat: 'Red boat, please.',
  blueBoat: 'Blue boat, please.',
  duck: 'The duck',
  cat: 'The cat',
  is: 'is',
  inBoat: 'in the boat',
  onDock: 'on the dock',
  duckBoat: 'The duck is in the boat.',
  catDock: 'The cat is on the dock.',
  duckDock: 'The duck is on the dock.',
  catBoat: 'The cat is in the boat.',
  thanks: 'Thank you!'
};

const melodies = {
  tap: [[0, 750, 0.07]],
  radio: [[0, 810, 0.06], [0.09, 1050, 0.06]],
  launch: [[0, 330, 0.12], [0.09, 440, 0.13], [0.2, 554, 0.16]],
  bell: [[0, 698, 0.28], [0, 1396, 0.13], [0.26, 880, 0.32]],
  success: [[0, 523, 0.12], [0.12, 659, 0.14], [0.26, 784, 0.24]],
  // Start time, pitch, duration, optional end pitch and waveform.
  actAB: [[0, 230, 0.105, 95, 'triangle'], [0.09, 360, 0.095, 180, 'triangle']],
  actCD: [[0, 410, 0.12, 570, 'triangle'], [0.12, 390, 0.08, 220]],
  actEF: [[0, 440, 0.23, 660], [0.10, 660, 0.24, 880]],
  actGH: [[0, 690, 0.20, 770, 'triangle'], [0.19, 770, 0.21, 700, 'triangle']],
  actIJ: [[0, 1160, 0.20], [0.05, 1750, 0.14]],
  actKL: [[0.14, 220, 0.09, 115, 'triangle']],
  actM: [[0, 170, 0.19, 66, 'triangle']],
  actN: [[0, 340, 0.16, 140, 'triangle']],
  actMN: [[0, 170, 0.13, 66, 'triangle'], [0.14, 340, 0.15, 140, 'triangle']],
  actOP: [[0, 690, 0.075, 100, 'triangle']],
  actQR: [[0, 950, 0.05, 510, 'triangle'], [0.09, 600, 0.07, 170, 'triangle']],
  actST: [[0, 570, 0.12, 940], [0.09, 480, 0.11, 730], [0.17, 670, 0.10, 1030]],
  actUV: [[0, 784, 0.19], [0.16, 587, 0.25]],
  actWX: [],
  actYZ: [[0, 1047, 0.18], [0.075, 1568, 0.25]]
};

const rustles = {
  actKL: { duration: 0.17, low: 880, high: 1850 },
  actST: { duration: 0.23, low: 1180, high: 780 },
  actWX: { duration: 0.31, low: 620, high: 1600 }
};

export function createAudio() {
  let context;
  let noise;
  let muted = false;
  let generation = 0;
  let audioElement;
  let cancelLine;
  const decoded = new Map();
  const ringing = new Set();

  function unlock() {
    try {
      const Context = window.AudioContext || window.webkitAudioContext;
      if (!context && Context) context = new Context();
      if (context && context.state !== 'running') context.resume().catch(() => {});
      if (!audioElement) {
        audioElement = new Audio();
        audioElement.setAttribute('playsinline', '');
      }
    } catch { /* HTML audio can still serve devices without Web Audio. */ }
  }

  function stop() {
    generation++;
    cancelLine?.();
    for (const note of ringing) {
      try { note.stop(); } catch { /* The note already ended. */ }
    }
    ringing.clear();
  }

  function effect(name) {
    if (muted) return;
    unlock();
    if (!context || context.state !== 'running') return;
    const now = context.currentTime;
    function play(source, output, start, duration, volume) {
      const gain = context.createGain();
      gain.gain.setValueAtTime(0.0001, start);
      gain.gain.exponentialRampToValueAtTime(volume, start + 0.012);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
      output.connect(gain);
      gain.connect(context.destination);
      ringing.add(source);
      source.onended = () => {
        ringing.delete(source);
        source.disconnect();
        if (output !== source) output.disconnect();
        gain.disconnect();
      };
      source.start(start);
      source.stop(start + duration + 0.02);
    }
    for (const [delay, frequency, duration, endPitch, waveform] of (melodies[name] || melodies.tap)) {
      const note = context.createOscillator();
      const start = now + delay;
      note.type = waveform || 'sine';
      note.frequency.setValueAtTime(frequency, start);
      if (endPitch) note.frequency.exponentialRampToValueAtTime(endPitch, start + duration);
      play(note, note, start, duration, 0.045);
    }
    const rustle = rustles[name];
    if (rustle) {
      if (!noise) {
        noise = context.createBuffer(1, Math.ceil(context.sampleRate * 0.4), context.sampleRate);
        const samples = noise.getChannelData(0);
        for (let i = 0; i < samples.length; i++) samples[i] = Math.random() * 2 - 1;
      }
      const source = context.createBufferSource();
      const filter = context.createBiquadFilter();
      source.buffer = noise;
      filter.type = 'bandpass';
      filter.Q.value = 0.75;
      filter.frequency.setValueAtTime(rustle.low, now);
      filter.frequency.exponentialRampToValueAtTime(rustle.high, now + rustle.duration);
      source.connect(filter);
      play(source, filter, now, rustle.duration, 0.055);
    }
  }

  function getBuffer(key, url) {
    if (!decoded.has(key)) {
      const pending = fetch(url)
        .then(response => {
          if (!response.ok) throw new Error('Unreadable recording');
          return response.arrayBuffer();
        })
        .then(bytes => context.decodeAudioData(bytes))
        .catch(error => { decoded.delete(key); throw error; });
      decoded.set(key, pending);
    }
    return decoded.get(key);
  }

  function playLine(key, token) {
    return new Promise(resolve => {
      const path = 'audio/' + key + '.mp3';
      const url = window.rescueAsset?.(path) ?? './' + path;
      let settled = false;
      let release = () => {};
      const finish = () => {
        if (settled) return;
        settled = true;
        clearTimeout(timer);
        if (cancelLine === finish) cancelLine = undefined;
        release();
        resolve();
      };
      // Guard against a missing media event when a mobile browser suspends.
      const timer = setTimeout(finish, 15000);
      cancelLine = finish;
      const valid = () => !settled && generation === token && !muted;
      const deviceVoice = () => {
        if (!valid() || !window.speechSynthesis || !window.SpeechSynthesisUtterance) return finish();
        const utterance = new SpeechSynthesisUtterance(lines[key]);
        utterance.lang = /[\u3400-\u9fff]/.test(lines[key]) ? 'zh-CN' : 'en-US';
        utterance.rate = 0.9;
        utterance.onend = finish;
        utterance.onerror = finish;
        release = () => {
          utterance.onend = null;
          utterance.onerror = null;
          window.speechSynthesis.cancel();
        };
        window.speechSynthesis.speak(utterance);
      };
      const playElement = () => {
        if (!valid()) return finish();
        if (!audioElement) return deviceVoice();
        audioElement.src = url;
        const fallback = () => {
          if (!valid()) return;
          audioElement.onended = null;
          audioElement.onerror = null;
          audioElement.pause();
          deviceVoice();
        };
        audioElement.onended = finish;
        audioElement.onerror = fallback;
        release = () => {
          audioElement.onended = null;
          audioElement.onerror = null;
          audioElement.pause();
        };
        audioElement.play().catch(error => {
          if (!valid()) return;
          if (error.name === 'NotAllowedError') return finish();
          if (audioElement.onerror === fallback) fallback();
        });
      };
      if (!context || context.state !== 'running') return playElement();
      getBuffer(key, url).then(buffer => {
        if (!valid()) return;
        const source = context.createBufferSource();
        source.buffer = buffer;
        source.connect(context.destination);
        source.onended = finish;
        release = () => {
          source.onended = null;
          try { source.stop(); } catch { /* Source has already ended. */ }
          source.disconnect();
        };
        source.start();
      }).catch(playElement);
    });
  }

  async function speak(keys) {
    stop();
    if (muted) return;
    unlock();
    const token = generation;
    for (const key of (Array.isArray(keys) ? keys : [keys])) {
      if (token !== generation || muted) return;
      if (Object.hasOwn(lines, key)) await playLine(key, token);
    }
  }

  return { speak, stop, effect, unlock, setMuted(value) { muted = Boolean(value); if (muted) stop(); } };
}
