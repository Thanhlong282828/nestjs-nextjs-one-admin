/* global getComputedStyle */
// Samples rendered background behind selected text; not a WCAG certification.
import { chromium } from '@playwright/test';
import sharp from 'sharp';
const cases = [
  [3190,'Admin heading','.welcome h1',3], [3190,'Admin intro','.welcome p',4.5],
  [3190,'Admin eyebrow','.eyebrow',4.5], [3190,'Metric label','.metric-top span',4.5],
  [3190,'Metric caption','.metric-foot',4.5], [3190,'Navigation label','.navitem span',4.5],
  [3190,'Status title','.data-notice strong',4.5],
  [3101,'Product heading','.hero-copy h1',3], [3101,'Product intro','.hero-copy p',4.5],
  [3101,'Product eyebrow','.shop-eyebrow',4.5], [3101,'Product navigation','.shop-header nav a',4.5],
];
const channel = v => { v /= 255; return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; };
const luminance = ([r,g,b]) => .2126 * channel(r) + .7152 * channel(g) + .0722 * channel(b);
const ratio = (a,b) => { const x=luminance(a), y=luminance(b); return (Math.max(x,y)+.05)/(Math.min(x,y)+.05); };
const browser = await chromium.launch();
try {
  for (const theme of ['light','dark']) for (const [port,label,selector,minimum] of cases) {
    const page=await browser.newPage({viewport:{width:1440,height:1000},deviceScaleFactor:1});
    try {
      await page.addInitScript(value=>localStorage.setItem('aurum-theme',value),theme);
      await page.goto(`http://127.0.0.1:${port}/`,{waitUntil:'networkidle'});
      const target=page.locator(selector).first(); await target.scrollIntoViewIfNeeded();
      const info=await target.evaluate(element=>{const r=element.getBoundingClientRect(),s=getComputedStyle(element);element.setAttribute('data-contrast-sample','');return {x:Math.floor(r.x+r.width/2),y:Math.floor(r.y+r.height/2),color:s.color,font:s.fontSize,weight:s.fontWeight};});
      const fg=info.color.match(/[\d.]+/g)?.slice(0,3).map(Number); if(!fg || fg.length!==3) throw Error(`unsupported color ${info.color}`);
      await page.addStyleTag({content:'[data-contrast-sample] { color: transparent !important; -webkit-text-fill-color: transparent !important; }'});
      const image=await page.screenshot(); const {data}=await sharp(image).removeAlpha().extract({left:info.x,top:info.y,width:1,height:1}).raw().toBuffer({resolveWithObject:true});
      const bg=[...data],value=ratio(fg,bg);console.log(JSON.stringify({theme,label,selector,fg,bg,ratio:Number(value.toFixed(2)),minimum,result:value>=minimum?'PASS':'FAIL',font:info.font,weight:info.weight}));
    } finally { await page.close(); }
  }
} finally { await browser.close(); }
