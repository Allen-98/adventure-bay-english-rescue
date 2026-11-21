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
function lesson(id,topic,name,words,cue,review=false){
  const meta=topics[topic];
  return {id,kind:'vocabulary',chapter:'words',topic,name,words,review,cue,
    english:review?meta.name+'复习':words.map(cap).join(' · '),
    call:review?meta.review:meta.call,badge:name+'章',symbol:meta.symbol};
}
export const newWordLessons=[
  lesson('flag-sun','color','晴天引航旗',['yellow','green'],'码头升旗时间到了，给黄色和绿色信号旗找到位置。'),
  lesson('flag-kite','color','风筝队的旗语',['purple','pink'],'风筝队要进港，替路马升起紫色和粉色的旗子。'),
  lesson('flag-light','color','灯塔旁的旗手',['orange','white'],'小船绕过灯塔，听电台把橙色和白色的旗子升起来。'),
  lesson('review-colors','color','救生圈归队',Object.keys(palette),'码头要收回八种颜色的救生圈。听清颜色，把它送回队里。',true),
  lesson('fruit-picking','fruit','果园第一篮',['apple','banana'],'野餐船来取货了。给客人装一份苹果和香蕉。'),
  lesson('fruit-market','fruit','集市补给船',['orange','pear'],'水果摊刚开门，帮路马把橙子和梨装进篮子。'),
  lesson('fruit-berries','fruit','莓果小摊',['grape','strawberry'],'小鸭在莓果摊等你。听听它要葡萄还是草莓。'),
  lesson('fruit-cool','fruit','清凉野餐篮',['peach','watermelon'],'帮海边野餐的小伙伴准备桃子和西瓜。'),
  lesson('review-fruit','fruit','野餐船开餐',fruitWords,'野餐船要开餐了。这次由客人用英文点水果。',true),
  lesson('family-parents','family','米米的两张照片',['mom','dad'],'小兔米米带来了相册。先听它介绍妈妈和爸爸，再替它送礼物。'),
  lesson('family-siblings','family','送给哥哥和妹妹',['sister','brother'],'米米想给妹妹和哥哥送礼物，点开照片听它介绍。'),
  lesson('family-grandparents','family','爷爷奶奶来做客',['grandma','grandpa'],'米米的奶奶和爷爷到了。听米米介绍，再替它送礼物。'),
  lesson('review-family','family','米米的家庭聚会',Object.keys(familyNames),'亲人们都到齐了。听米米的英文留言，把礼物一份份送出去。',true)
];

export function wordAudio(topic,word){
  return topic==='color' && (word==='red'||word==='blue')?word:'w'+cap(word);
}
export function wordArt(topic,word){
  if(topic==='color')return null;
  if(topic==='harbor')return word==='boat'?'boat-blue':word;
  return topic+'-'+word;
}
