import {hasStudioPlate} from './studio-cache.mjs';
// 0.14 liquid is a live 3D SDF film. The old Cycles plate remains archived only.
export function hasLiquidPlate(_c){return false;}
export function hasMaterialPlate(c){return hasStudioPlate(c);}
