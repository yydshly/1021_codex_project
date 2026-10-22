import type {EffectConfig} from '../../scripts/effects.mjs';
import type {EffectAssets} from './canvas';
import {collageFilm014} from './collage-film-014';
import {pixelFilm014} from './pixel-film-014';
import {morphFilm014} from './morph-film-014';
import {bauhausFilm014} from './bauhaus-film-014';
import {solarFilm014} from './solar-film-014';
import {handFilm014} from './hand-film-014';
import {hanaziFilm014} from './hanazi-film-014';
import {citrusFilm014} from './citrus-film-014';
import {lineFilm014} from './line-film-014';
import {lineFilm016} from './line-film-016';
import {scienceFilm016} from './science-film-016';
import {handFilm017} from './hand-film-017';
import {morphFilm017} from './morph-film-017';
export function paintCanvasV3(g:CanvasRenderingContext2D,c:EffectConfig,seconds:number,assets:EffectAssets){const t=seconds/c.duration*10;g.save();g.clearRect(0,0,1280,720);g.lineJoin='round';g.lineCap='round';switch(c.style){case 'flat-vector':citrusFilm014(g,c,t);break;case 'line-art':lineFilm016(g,c,t);break;case 'morph':morphFilm017(g,c,t);break;case 'bauhaus':bauhausFilm014(g,c,t);break;case 'collage':collageFilm014(g,c,t,assets);break;case 'hanazi':hanaziFilm014(g,c,t,assets);break;case 'paperclip':scienceFilm016(g,c,t);break;case 'pixel':pixelFilm014(g,c,seconds);break;case 'cel-boil':handFilm017(g,c,t,assets);break;}g.restore();}
