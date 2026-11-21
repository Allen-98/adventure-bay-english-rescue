// The same keys drive the recorded lines and the device-voice recovery path.
const lines = {
  intro: '队长，冒险湾来电话啦！点一张任务卡，看看谁需要帮助。',
  dispatchLetters: '浮台起雾了，两只鸭宝宝等着回家。队长，跟路马一起去开灯吧！',
  dispatchColors: '两艘小船回到港口啦。队长，听听船长的话，帮他们靠岸吧！',
  dispatchRadio: '天天在空中看不清小动物。队长，用对讲机告诉她，先接谁吧！',
  welcomeBack: '队长，欢迎回到瞭望塔！',
  missionDone: '大家都平安到家了！谢谢你，队长！',
  letterIntro: '跟着路马开灯，接鸭宝宝回家。听听这个字母，再点浮台。',
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
  a: 'A.',
  b: 'B.',
  red: 'Red.',
  blue: 'Blue.',
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
  success: [[0, 523, 0.12], [0.12, 659, 0.14], [0.26, 784, 0.24]]
};

export function createAudio() {
  let context;
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
    for (const [delay, frequency, duration] of (melodies[name] || melodies.tap)) {
      const note = context.createOscillator();
      const gain = context.createGain();
      const start = context.currentTime + delay;
      note.frequency.value = frequency;
      gain.gain.setValueAtTime(0.0001, start);
      gain.gain.exponentialRampToValueAtTime(0.045, start + 0.012);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
      note.connect(gain);
      gain.connect(context.destination);
      ringing.add(note);
      note.onended = () => { ringing.delete(note); note.disconnect(); gain.disconnect(); };
      note.start(start);
      note.stop(start + duration + 0.02);
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
