/** GitHub Pages publishes the browser workbench without the local Node API. */
export const isStaticPages=typeof window!=='undefined'&&window.location.hostname.endsWith('.github.io');

export const STATIC_SERVICE_NOTICE='线上为静态预览；AI 编排和新 MP4 输出需要启动本地 Node 工作台。';
