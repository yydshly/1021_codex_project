import {storyFilms017} from './story-films-017.mjs';
// Finite authored stories. A new subject changes objects, events and composition.
export const storyFilms016={
 'line-art':[
  {id:'concert',name:'听见线的形状',subtitle:'从一根琴弦，到一整场共鸣',words:['起弦','共鸣','合奏'],primary:'#e4bd73',secondary:'#102f39',summary:'琴弦牵出小提琴，弓弦接触带出声线；声线接续铜管、谱线与舞台，拉远揭示合奏。'},
  {id:'garden',name:'给春天回信',subtitle:'把一点耐心，浇成满园回响',words:['落水','生根','盛放'],primary:'#d6c185',secondary:'#153d38',summary:'水壶倾斜，水滴落地牵出根系；茎叶逐节生长，花瓣展开，蝴蝶循线飞离。'}
 ],
 paperclip:[
  {id:'anc',name:'声音如何被消掉',subtitle:'多发出一道声，为什么反而更安静？',words:['拾音','反相','叠加'],primary:'#e77648',secondary:'#216c70',summary:'耳罩拆层，麦克风拾音；原波与反相波共同进入相加窗口，显示残余声压。'},
  {id:'prism',name:'白光里的彩虹',subtitle:'棱镜没有染色，它把颜色分开',words:['入射','折射','色散'],primary:'#e5a453',secondary:'#345591',summary:'白光穿过三棱镜，两次折射形成分离的色谱；独立放大出射面，比较不同颜色的偏折。'}
 ]
};
Object.assign(storyFilms016,storyFilms017);
export function storyFilm016(style,id){const rows=storyFilms016[style];return rows?.find(x=>x.id===id)||rows?.[0];}
export function applyStory016(config,id){const s=storyFilms016[config.style]?.find(x=>x.id===id);if(!s)throw new Error('该风格没有这个故事方案。');return {...config,storyId:s.id,title:s.name,subtitle:s.subtitle,words:[...s.words],primary:s.primary,secondary:s.secondary};}
