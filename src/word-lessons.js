export const topics={
  color:{name:'颜色',station:'海湾信号站',call:'routeColor',review:'reviewColor',intro:'colorTouch',action:'升起引航旗',result:'信号已经升起！',done:'引航信号全部就位。',symbol:'flag'},
  fruit:{name:'水果',station:'野餐补给站',call:'routeFruit',review:'reviewFruit',intro:'fruitTouch',action:'给客人装篮',result:'收到一份水果！',done:'野餐篮已经装好，可以发船了。',symbol:'anchor'},
  family:{name:'家人称呼',station:'米米的家庭相册',call:'routeFamily',review:'reviewFamily',intro:'familyTouch',action:'替米米送礼物',result:'礼物送到了！',done:'米米把礼物都送到家人手里啦。',symbol:'medal'},
  harbor:{name:'乘客与地点',station:'码头单词救援',intro:'vocabTouch',action:'听电台',result:'找到了！',done:'码头准备好了。',symbol:'anchor'}
};
export const palette={red:'#d93837',blue:'#247ee4',yellow:'#ffda25',green:'#28a25b',purple:'#8a4ed3',pink:'#fa91b8',orange:'#ff841f',white:'#fffdf9'};
export const familyNames={mom:'妈妈',dad:'爸爸',sister:'妹妹',brother:'哥哥',grandma:'奶奶',grandpa:'爷爷'};
export const fruitWords=['apple','banana','orange','pear','grape','strawberry','peach','watermelon'];
export const cap=text=>text[0].toUpperCase()+text.slice(1);
// Identify the spoken word on both sides of the same action. Review pairs come from different lessons.
export function listeningRounds(words,review){
  const targets=[...words];
  for(let i=targets.length-1;i>0;i--){
    const j=Math.floor(Math.random()*(i+1));
    [targets[i],targets[j]]=[targets[j],targets[i]];
  }
  return targets.map(word=>{
    const group=Math.floor(words.indexOf(word)/2);
    const others=words.filter((entry,i)=>entry!==word && (!review || Math.floor(i/2)!==group));
    const other=others[Math.floor(Math.random()*others.length)];
    return {word,choices:Math.random()<.5?[word,other]:[other,word]};
  });
}

// The workshop supplies the object, the physical action and its visible result.
// 'arm' puts the prop in the child's hand before they listen for its recipient.
export const workshops={
  'flag-sun': {mode:'flag',voice:'wsFlag',prop:'letter-tower',step:'operate',act:'拉动升旗绳',success:'引航旗升起来了！',effect:'actEF'},
  'flag-kite': {mode:'kite',voice:'wsKite',prop:'skye',step:'operate',act:'松开风筝线',success:'风筝飞上天空了！',effect:'actGH'},
  'flag-light': {mode:'lamp',voice:'wsLamp',prop:'letter-tower',act:'开启灯塔',success:'信号灯亮了，小船开过来了！',effect:'actEF'},
  'review-colors': {mode:'ring',voice:'wsRing',prop:'zuma-boat',act:'送出救生圈',success:'路马接住救生圈了！',effect:'actST'},
  'fruit-picking': {mode:'tree',voice:'wsTree',prop:'letter-basket',act:'摇一摇果树',success:'摘到啦，水果落进篮子了！',effect:'actCD'},
  'fruit-market': {mode:'scale',voice:'wsScale',prop:'word-scale',step:'operate',act:'按一下秤盘',success:'指针转起来了，水果称好啦！',effect:'bell'},
  'fruit-berries': {mode:'juice',voice:'wsJuice',prop:'word-blender',step:'operate',act:'按下榨汁开关',success:'一杯新鲜果汁做好了！',effect:'actST'},
  'fruit-cool': {mode:'cool',voice:'wsCool',prop:'word-cooler',step:'operate',act:'盖上保冷箱',success:'盖好啦，水果可以冰冰凉凉去野餐了！',effect:'actAB'},
  'review-fruit': {mode:'serve',voice:'wsServe',prop:'duck',act:'给客人上水果',success:'客人收到点的水果了！',effect:'bell'},
  'family-parents': {mode:'photo',voice:'wsPhoto',prop:'word-camera',step:'operate',act:'按快门拍合影',success:'咔嚓！家人的照片放进相册啦。',effect:'actQR'},
  'family-siblings': {mode:'gift',voice:'wsGift',prop:'word-gift',step:'arm',act:'拿起礼物',success:'送到手里啦！',effect:'actCD'},
  'family-grandparents': {mode:'ticket',voice:'wsTicket',prop:'word-ticket',act:'送出船票',success:'收到船票，可以上船啦！',effect:'actKL'},
  'review-family': {mode:'party',voice:'wsParty',prop:'word-chair',act:'邀请家人入座',success:'家人们坐在一起啦。',effect:'success'},
  passengers: {mode:'board',voice:'dispatchPassengers',prop:'boat-blue',act:'接乘客上船',success:'乘客上船啦！',effect:'bell'},
  places: {mode:'locate',voice:'dispatchPlaces',prop:'zuma-boat',act:'给路马指路',success:'路马找到了停靠点！',effect:'radio'}
};
function lesson(id,topic,name,words,cue,review=false){
  const meta=topics[topic];
  return {id,kind:'vocabulary',chapter:'words',topic,name,words,review,cue,
    english:review?meta.name+'复习':words.map(cap).join(' · '),
    call:workshops[id].voice,badge:name+'章',symbol:meta.symbol};
}
export const newWordLessons=[
  lesson('flag-sun','color','晴天引航旗',['yellow','green'],'码头升旗时间到了，给黄色和绿色信号旗找到位置。'),
  lesson('flag-kite','color','风筝队起飞',['purple','pink'],'听天天报颜色，选对风筝，再松手让它飞起来。'),
  lesson('flag-light','color','给灯塔通电',['orange','white'],'小船正在进港，替它打开橙色或白色的信号灯。'),
  lesson('review-colors','color','救生圈归队',Object.keys(palette),'码头要收回八种颜色的救生圈。听清颜色，把它送回队里。',true),
  lesson('fruit-picking','fruit','摇树摘果子',['apple','banana'],'小船来取货了。摇一摇枝头，把苹果和香蕉摘进篮子。'),
  lesson('fruit-market','fruit','集市水果秤',['orange','pear'],'给集市的橙子和梨称一称，看看指针转到哪里。'),
  lesson('fruit-berries','fruit','莓果榨汁屋',['grape','strawberry'],'听小鸭点水果，帮它榨一杯葡萄汁或草莓汁。'),
  lesson('fruit-cool','fruit','野餐保冷箱',['peach','watermelon'],'给海边野餐的小伙伴装桃子和西瓜，盖好保冷箱。'),
  lesson('review-fruit','fruit','野餐船开餐',fruitWords,'野餐船要开餐了。这次由客人用英文点水果。',true),
  lesson('family-parents','family','米米的照相馆',['mom','dad'],'小兔米米带来了相机。听它介绍妈妈和爸爸，按下快门给他们拍照。'),
  lesson('family-siblings','family','送给哥哥和妹妹',['sister','brother'],'先拿起礼物，再听米米说，亲手交给妹妹或哥哥。'),
  lesson('family-grandparents','family','爷爷奶奶的船票',['grandma','grandpa'],'米米带来了两张船票，帮奶奶和爷爷取票上船。'),
  lesson('review-family','family','米米的家庭聚会',Object.keys(familyNames),'听米米用英语介绍亲人，邀请他们一位一位坐到桌边。',true)
];

export function wordAudio(topic,word){
  return topic==='color' && (word==='red'||word==='blue')?word:'w'+cap(word);
}
export function wordArt(topic,word){
  if(topic==='color')return null;
  if(topic==='harbor')return word==='boat'?'boat-blue':word;
  return topic+'-'+word;
}
