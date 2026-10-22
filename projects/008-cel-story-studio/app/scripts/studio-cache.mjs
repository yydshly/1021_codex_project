import {effectDefaults} from './effects.mjs';
export function hasStudioPlate(c){const d=effectDefaults('3d-render');return c.style==='3d-render'&&['primary','secondary','count','intensity','detail','seed'].every(k=>c[k]===d[k]);}
