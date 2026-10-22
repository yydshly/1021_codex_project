# 0.19 网页发布与完整合集保留

GitHub Pages 承载研究总结、全部十五种风格单片、原作、截图与历史逐项对比。完整连播合集保存在 [GitHub Release：mg-styles-research-019](https://github.com/yydshly/1021_codex_project/releases/tag/mg-styles-research-019)，网页中的合集入口改为对应 Release 下载地址。

这一步只改变发布位置，没有压缩、转码或更改影片画面。二十个合集路径按 SHA256 归并成十六个完整资产；每个旧路径与新地址的关系、字节数和哈希记录在 [`web/pages-media-019.json`](web/pages-media-019.json)。所有独立影片和截图保留原文件；原始本地研究目录也继续保留。

## 构建与整理

在完整的发布副本 `app/` 中依次执行：

```powershell
npm run build
node scripts/prepare-pages.mjs
```

`prepare-pages.mjs` 将完整合集校验复制到仓库外相邻的 `release-assets/`，生成上传清单，改写网页中的合集链接，再移出对应静态副本。它还删除当前 `app.js`、`app.css` 及递归模块引用以外的旧哈希分包；保留所有独立成片与图片。脚本可以重复执行，构建后新产生的同一批合集链接会再次映射。

脚本保护原 F 盘研究目录，Windows 下只在 D 盘发布副本运行。`release-assets/` 和其中的本机上传清单不提交到 Git，合集 MP4 作为 Release 资产上传。

如果从已精简的远端仓库重新开始，先从上述 Release 恢复仓库外 `release-assets/` 中的原始合集，再执行整理：

```powershell
# 在仓库根目录执行；需要已登录 GitHub CLI。
gh release download mg-styles-research-019 -R yydshly/1021_codex_project -D ../release-assets --pattern '*.mp4'
```

## 静态站点边界

远端 Pages 可阅读研究、观看已有影片、查看原作与前后版本，以及使用浏览器端已有预览和参数控件。它没有 Node 服务端，不能运行本机 AI、提交新渲染任务或代替本地 Remotion/Blender 环境。新视频的创作与输出仍按项目 README 在本地运行。

## 校验依据

本轮发布整理已比较 521 个非合集媒体/图片/字体与原始研究文件，SHA256 全部相同；十六个 Release 本地备份也逐文件通过 SHA256 核验。再次执行整理时，站点字节数不变，且没有重复改链或重复删除文件。这里只证明发布完整性，不将其作为影片艺术质量达标的依据。
