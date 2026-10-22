export type StyleId='flat-vector'|'line-art'|'isometric'|'3d-render'|'cel-boil'|'collage'|'liquid'|'morph'|'bauhaus'|'synthwave'|'aurora-glass'|'hanazi'|'paperclip'|'pixel'|'hud';
export type VisualStyle={id:StyleId;slug:string;name:string;en:string;group:string;color:string;principle:string;value:string;useCases:string;extension:string;implementation:string;scope:string};
export const DEFAULT_STYLE:StyleId;
export const styles:VisualStyle[];
export const styleIds:StyleId[];
export function getStyle(id?:string):VisualStyle;
export function validateStyle(value:unknown):StyleId;
