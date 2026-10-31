// Daily-training drill animations: tiny keyframed 3D stick-figure rig drawn on small canvases.
// window.DRILL_SET = 'fh' (forehand page) | 'bh' (backhand page)
(function(){
const root=document.getElementById('drills');if(!root)return;
const R=Math.PI/180;
const add=(a,b)=>[a[0]+b[0],a[1]+b[1],a[2]+b[2]],sub=(a,b)=>[a[0]-b[0],a[1]-b[1],a[2]-b[2]],mul=(a,k)=>[a[0]*k,a[1]*k,a[2]*k],dot=(a,b)=>a[0]*b[0]+a[1]*b[1]+a[2]*b[2],nrm=a=>mul(a,1/(Math.hypot(...a)||1));
const lerp=(a,b,e)=>Array.isArray(a)?a.map((v,i)=>v+(b[i]-v)*e):a+(b-a)*e;
function ik(A,B,l1,l2,pole){
  const v=sub(B,A);let d=Math.hypot(...v);const dir=mul(v,1/(d||1));d=Math.min(d,l1+l2-1e-4);
  const a=(l1*l1-l2*l2+d*d)/(2*d),h=Math.sqrt(Math.max(0,l1*l1-a*a));
  return add(add(A,mul(dir,a)),mul(nrm(sub(pole,mul(dir,dot(pole,dir)))),h));
}
// h/s = hip/shoulder yaw in degrees (+ = turned right); hands rh/lh and racket dir rd are in torso frame (right, up, forward)
const DEF={h:0,s:0,py:.86,px:0,pz:0,rh:[.1,-.32,.3],lh:[-.1,-.32,.3],ankR:[.2,.07,0],ankL:[-.2,.07,0]};
function sample(ex,t){
  const K=ex.keys,T=K[K.length-1].t;t=((t%T)+T)%T;
  let i=0;while(i<K.length-2&&t>K[i+1].t)i++;
  const a={...DEF,...ex.base,...K[i]},b={...DEF,...ex.base,...K[i+1]};
  const u=Math.min(1,Math.max(0,(t-a.t)/((b.t-a.t)||1))),e=u*u*(3-2*u),o={};
  for(const k in a)if(k!=='t')o[k]=b[k]===undefined?a[k]:lerp(a[k],b[k],e);
  return o;
}
function pose(ex,t){
  const o=sample(ex,t);
  const rg=a=>[Math.cos(a*R),0,-Math.sin(a*R)],fw=a=>[Math.sin(a*R),0,Math.cos(a*R)];
  const hr=rg(o.h),hf=fw(o.h),sr=rg(o.s),sf=fw(o.s);
  const P=[o.px,o.py,o.pz],hipR=add(P,mul(hr,.16)),hipL=add(P,mul(hr,-.16));
  const kneeR=o.kneeR||ik(hipR,o.ankR,.46,.46,hf),kneeL=o.kneeL||ik(hipL,o.ankL,.46,.46,hf);
  const toe=(a,k)=>ex.sit?add(a,mul(nrm(sub(a,k)),.1)):[a[0],0,a[2]+.12];
  const C=add(add(P,[0,.48,0]),mul(hf,.04));
  const loc=l=>add(add(mul(sr,l[0]),[0,l[1],0]),mul(sf,l[2]));
  const shR=add(C,mul(sr,.2)),shL=add(C,mul(sr,-.2)),handR=add(C,loc(o.rh));
  const d=o.rd?nrm(loc(o.rd)):null;
  const handL=ex.two&&d?add(handR,mul(d,.12)):add(C,loc(o.lh));
  const J={P,hipR,hipL,kneeR,kneeL,ankR:o.ankR,ankL:o.ankL,toeR:toe(o.ankR,kneeR),toeL:toe(o.ankL,kneeL),C,shR,shL,handR,handL,d,
    elbR:ik(shR,handR,.3,.29,add([0,-1,0],mul(sr,.4))),elbL:ik(shL,handL,.3,.29,add([0,-1,0],mul(sr,-.4))),
    neck:add(C,[0,.1,0]),head:add(C,[0,.24,0]),mid:mul(add(handR,handL),.5)};
  if(d){let w=sub([0,1,0],mul(d,d[1]));if(Math.hypot(...w)<.2)w=sub(sf,mul(d,dot(sf,d)));J.w=nrm(w);J.butt=add(handR,mul(d,-.06));J.throat=add(handR,mul(d,.33));J.hc=add(handR,mul(d,.5))}
  return J;
}
function fit(cv){const r=cv.getBoundingClientRect(),k=window.devicePixelRatio||1,W=Math.max(1,Math.round(r.width*k)),H=Math.max(1,Math.round(r.height*k));if(cv.width!==W||cv.height!==H){cv.width=W;cv.height=H}return k}
function render(cv,ex,t,col){
  const k=fit(cv),ctx=cv.getContext('2d'),W=cv.width,H=cv.height;
  ctx.clearRect(0,0,W,H);ctx.lineCap='round';ctx.lineJoin='round';ctx.setLineDash([]);
  if(ex.draw2d){ex.draw2d(ctx,W,H,t,col,k);return}
  const c=ex.cam||{},m=ex.mirror?-1:1,ox0=c.ox??.5,sc=H/(c.v||2.6),ox=W*(m>0?ox0:1-ox0),oy=H*(c.oy??.9);
  const ph=(c.phi??30)*R,th=(c.th??12)*R,cp=Math.cos(ph),sp=Math.sin(ph),ct=Math.cos(th),st=Math.sin(th);
  const f=p=>{const x=p[0]*cp-p[2]*sp,z=p[0]*sp+p[2]*cp;return{x:ox+m*sc*x,y:oy-sc*(p[1]*ct+z*st),d:z*ct-p[1]*st}};
  const lw=x=>x*sc/110;
  ctx.strokeStyle=col.line;ctx.lineWidth=k;
  const ln=(a,b)=>{const A=f(a),B=f(b);ctx.beginPath();ctx.moveTo(A.x,A.y);ctx.lineTo(B.x,B.y);ctx.stroke()};
  for(let z=-.8;z<=.81;z+=.4)ln([-1,0,z],[1,0,z]);
  for(let x=-1;x<=1.01;x+=.5)ln([x,0,-.8],[x,0,.8]);
  const J=pose(ex,t),items=[];
  const seg=(a,b,c,w,dash)=>{const A=f(a),B=f(b);items.push({k:'s',A,B,c,w,dash,d:(A.d+B.d)/2})};
  for(const [a,b] of [['hipR','kneeR'],['kneeR','ankR'],['ankR','toeR'],['hipL','kneeL'],['kneeL','ankL'],['ankL','toeL'],['P','neck'],['shR','elbR'],['elbR','handR'],['shL','elbL'],['elbL','handL']])seg(J[a],J[b],col.ink,5);
  seg(J.hipL,J.hipR,col.hip,8);seg(J.shL,J.shR,col.court,7);
  if(J.d){
    seg(J.butt,J.throat,col.ink,3.5);
    const ring=[];for(let i=0;i<20;i++){const a=i/20*2*Math.PI;ring.push(f(add(J.hc,add(mul(J.d,Math.cos(a)*.17),mul(J.w,Math.sin(a)*.13)))))}
    items.push({k:'p',pts:ring,d:f(J.hc).d});
  }
  const Hd=f(J.head);items.push({k:'c',p:Hd,r:.11*sc,d:Hd.d,fill:col.panel});
  if(ex.props)for(const p of ex.props(t,J,col,tt=>pose(ex,tt))){
    if(p.k==='line')seg(p.a,p.b,p.c,p.w,p.dash);
    else{const P=f(p.p);items.push({k:'c',p:P,r:p.r*sc,d:P.d,fill:p.fill})}
  }
  items.sort((a,b)=>b.d-a.d);
  for(const it of items){
    if(it.k==='s'){ctx.setLineDash(it.dash?[6*k,5*k]:[]);ctx.strokeStyle=it.c;ctx.lineWidth=lw(it.w);ctx.beginPath();ctx.moveTo(it.A.x,it.A.y);ctx.lineTo(it.B.x,it.B.y);ctx.stroke();ctx.setLineDash([])}
    else if(it.k==='p'){ctx.beginPath();it.pts.forEach((p,i)=>i?ctx.lineTo(p.x,p.y):ctx.moveTo(p.x,p.y));ctx.closePath();ctx.globalAlpha=.25;ctx.fillStyle=col.court;ctx.fill();ctx.globalAlpha=1;ctx.strokeStyle=col.ink;ctx.lineWidth=lw(3);ctx.stroke()}
    else{ctx.beginPath();ctx.arc(it.p.x,it.p.y,it.r,0,2*Math.PI);ctx.fillStyle=it.fill;ctx.fill();ctx.strokeStyle=col.ink;ctx.lineWidth=lw(2.5);ctx.stroke()}
  }
}

// ---------- drills ----------
const band=(anchor)=>(t,J,col)=>[{k:'line',a:anchor,b:J.mid,c:col.hip,w:3,dash:true},{k:'dot',p:anchor,r:.05,fill:col.ink}];

const FH_SWING={name:'鏡前空揮',cue:'動作會在每個檢查點停一下：轉體、下沉、髖先轉、擊球、收拍。對著鏡子做一樣的停頓。',
  base:{ankR:[.42,.07,-.05],ankL:[-.28,.07,.2]},cam:{phi:35,ox:.45},still:2.1,keys:[
  {t:0,  h:0,  s:0,  py:.86,px:0,  rh:[.10,-.32,.30], rd:[0,.45,.9],    lh:[-.04,-.26,.34]},
  {t:.8, h:45, s:90, py:.80,px:.10,rh:[.25,-.08,.30], rd:[.1,.9,.25],   lh:[0,0,.45]},
  {t:1.4,h:40, s:88, py:.74,px:.18,rh:[.42,-.18,-.02],rd:[.6,-.6,.25],   lh:[0,-.05,.45]},
  {t:1.8,h:10, s:60, py:.79,px:.12,rh:[.42,-.32,.12], rd:[.9,-.3,-.15],  lh:[-.2,-.08,.35]},
  {t:2.1,h:-10,s:0,  py:.85,px:.02,rh:[.36,-.26,.48], rd:[1,.08,.12],    lh:[-.3,-.18,.15]},
  {t:2.5,h:-45,s:-75,py:.88,px:-.12,rh:[-.22,.18,.28],rd:[-.35,.45,-.8], lh:[-.22,.12,.3]},
  {t:3.3,h:-45,s:-75,py:.88,px:-.12,rh:[-.22,.18,.28],rd:[-.35,.45,-.8], lh:[-.22,.12,.3]},
  {t:4.3,h:0,  s:0,  py:.86,px:0,  rh:[.10,-.32,.30], rd:[0,.45,.9],    lh:[-.04,-.26,.34]}]};

const BH_SWING={name:'鏡前雙手空揮',cue:'動作會在每個檢查點停一下：轉體、下沉、右腳踩進髖先轉、擊球、收拍。',
  two:true,base:{ankL:[.05,.07,-.25],ankR:[-.38,.07,.3]},cam:{phi:-35,ox:.58},still:2.1,keys:[
  {t:0,  h:0,  s:0,   py:.86,px:0,   pz:.02, rh:[0,-.32,.32],   rd:[0,.45,.9]},
  {t:.8, h:-50,s:-100,py:.80,px:0,   pz:-.02,rh:[-.2,-.28,.25], rd:[-.2,.85,.2]},
  {t:1.4,h:-50,s:-100,py:.74,px:.02, pz:-.05,rh:[-.22,-.34,.16],rd:[-.75,-.45,.2]},
  {t:1.8,h:-20,s:-85, py:.78,px:-.08,pz:.05, rh:[-.18,-.35,.2], rd:[-.85,-.35,-.2]},
  {t:2.1,h:10, s:-5,  py:.82,px:-.15,pz:.12, rh:[-.1,-.28,.42], rd:[-1,.05,.1]},
  {t:2.5,h:30, s:60,  py:.88,px:-.18,pz:.1,  rh:[.22,.2,.22],   rd:[.35,.5,-.8]},
  {t:3.3,h:30, s:60,  py:.88,px:-.18,pz:.1,  rh:[.22,.2,.22],   rd:[.35,.5,-.8]},
  {t:4.3,h:0,  s:0,   py:.86,px:0,   pz:.02, rh:[0,-.32,.32],   rd:[0,.45,.9]}]};

const THROW={name:'藥球側拋',cue:'球放在右髖旁，重心壓右腳，蹬地轉髖把球甩向牆。手臂只是拿著球。',
  base:{ankR:[.35,.07,-.05],ankL:[-.3,.07,.15]},cam:{phi:55,ox:.72,v:2.7},still:.8,keys:[
  {t:0,  h:45, s:70, py:.84,px:.05, rh:[.12,-.35,.3], lh:[0,-.35,.32]},
  {t:.8, h:45, s:95, py:.74,px:.15, rh:[.28,-.42,.12],lh:[.15,-.45,.2]},
  {t:1.1,h:-15,s:-25,py:.86,px:-.05,rh:[.05,-.05,.52],lh:[-.08,-.05,.52]},
  {t:1.9,h:-15,s:-25,py:.86,px:-.05,rh:[.05,-.05,.52],lh:[-.08,-.05,.52]},
  {t:2.8,h:45, s:70, py:.84,px:.05, rh:[.12,-.35,.3], lh:[0,-.35,.32]}],
  props:(t,J,col,P)=>{
    const tt=((t%2.8)+2.8)%2.8,rel=P(1.1).mid,Wp=[rel[0]-.4,rel[1]+.15,2.35];let b;
    if(tt<1.1||tt>=1.9)b=J.mid;
    else if(tt<1.45)b=lerp(rel,Wp,(tt-1.1)/.35);
    else{const u=(tt-1.45)/.45;b=lerp(Wp,rel,u);b[1]+=Math.sin(Math.PI*u)*.25}
    const wl=(a,c)=>({k:'line',a,b:c,c:col.muted,w:2});
    return [wl([-1,0,2.4],[.6,0,2.4]),wl([.6,0,2.4],[.6,1.8,2.4]),wl([.6,1.8,2.4],[-1,1.8,2.4]),wl([-1,1.8,2.4],[-1,0,2.4]),{k:'dot',p:b,r:.12,fill:col.ball}];
  }};

const CHOP_A={h:35,s:70,py:.74,px:.08,rh:[.1,-.45,.3],lh:[0,-.45,.33]},CHOP_B={h:-25,s:-45,py:.88,px:-.06,rh:[0,.4,.38],lh:[-.08,.4,.38]};
const CHOP={name:'彈力帶伐木',cue:'彈力帶固定在右下方，從右下拉到左上。腿和髖先動，手臂保持伸直、不出力拉。',
  base:{ankR:[.32,.07,0],ankL:[-.32,.07,0]},cam:{phi:25,ox:.45},still:.7,
  keys:[{t:0,...CHOP_A},{t:.7,...CHOP_B},{t:1.3,...CHOP_B},{t:2.6,...CHOP_A},{t:3.0,...CHOP_A}],props:band([.95,.2,-.35])};

const PAL_A={rh:[.04,-.14,.14],lh:[-.04,-.14,.14]},PAL_B={rh:[.04,-.1,.55],lh:[-.04,-.1,.55]};
const PALLOF={name:'Pallof 抗旋轉推',cue:'彈力帶從側面拉著你，雙手往前推直、停 2 秒再收回。重點是身體不能被拉轉。左右兩側都要做。',
  base:{ankR:[.22,.07,0],ankL:[-.22,.07,0],py:.82},cam:{phi:50,ox:.45},still:.8,
  keys:[{t:0,...PAL_A},{t:.8,...PAL_B},{t:1.9,...PAL_B},{t:2.7,...PAL_A},{t:3.2,...PAL_A}],props:band([1.3,1.12,.1])};

const LUNGE_K=[{t:0,py:.9},{t:.8,py:.6},{t:1.5,py:.6,h:-10,s:-60},{t:2.2,py:.6,h:-10,s:-60},{t:2.9,py:.6},{t:3.6,py:.9},{t:4.1,py:.9}];
const dumbbell=(t,J,col)=>[{k:'dot',p:J.mid,r:.06,fill:col.ink}];
const LUNGE={name:'弓步轉體',cue:'左腳在前弓步蹲低，上半身轉向左邊（前腳方向），髖和膝蓋保持穩定不晃。',
  base:{ankL:[-.15,.07,.45],ankR:[.15,.12,-.45],rh:[.05,-.15,.3],lh:[-.05,-.15,.3]},cam:{phi:70,ox:.5},still:1.5,keys:LUNGE_K,props:dumbbell};

const SINGLE_A={h:0,s:0,px:.06,rh:[.55,-.1,.05],lh:[-.55,-.1,.05]};
const SINGLE={name:'單腳站平衡',cue:'右腳單腳站，上半身小幅慢慢轉動，支撐腳和骨盆保持不晃。進階可閉眼或站軟墊。',
  base:{ankR:[.08,.07,0],ankL:[-.18,.42,.12]},cam:{phi:20,ox:.5},still:0,
  keys:[{t:0,...SINGLE_A},{t:1.2,h:15,s:35,px:.08,rh:[.5,-.2,.1],lh:[-.5,0,.1]},{t:2.4,...SINGLE_A}]};

const RF={kneeR:[.16,.08,.44],ankR:[-.28,.06,.46],kneeL:[-.6,.08,0],ankL:[-.6,.06,-.44]};
const MID={kneeR:[.3,.45,.25],ankR:[.4,.06,.35],kneeL:[-.3,.45,.25],ankL:[-.4,.06,.35]};
const LF={kneeL:[-.16,.08,.44],ankL:[.28,.06,.46],kneeR:[.6,.08,0],ankR:[.6,.06,-.44]};
const NINETY={name:'90/90 髖活動',cue:'坐姿，兩腿都彎成 90°。雙膝像雨刷一樣倒向另一邊換邊，上半身保持直立。',
  sit:true,base:{py:.12,rh:[.3,-.5,-.25],lh:[-.3,-.5,-.25]},cam:{phi:25,th:30,v:1.5,oy:.75},still:0,
  keys:[{t:0,...RF},{t:.8,...RF},{t:1.6,...MID},{t:2.4,...LF},{t:3.2,...LF},{t:4.0,...MID},{t:4.8,...RF}]};

const ss=x=>x*x*(3-2*x);
const OPENBOOK={name:'胸椎開書式',cue:'側躺、膝蓋疊住不動。上面的手像翻書一樣打開到另一側，眼睛跟著手，停 2 秒再回來。',still:2,
  draw2d(ctx,W,H,t,col,k){
    const u0=(t%4)/4,u=u0<.4?ss(u0/.4):u0<.55?1:u0<.95?1-ss((u0-.55)/.4):0;
    const fy=H*.8,cx=W*.45,L=H*.22,A=H*.42,lw=H/40;
    ctx.strokeStyle=col.line;ctx.lineWidth=k*1.5;ctx.beginPath();ctx.moveTo(W*.05,fy);ctx.lineTo(W*.95,fy);ctx.stroke();
    const bS=[cx,fy-H*.06],th=(90+70*u)*R,tS=[bS[0]+L*Math.cos(th),bS[1]-L*Math.sin(th)];
    const ph=(5+180*u)*R,hand=[tS[0]+A*Math.cos(ph),Math.min(fy-H*.03,tS[1]-A*Math.sin(ph))];
    const L2=(a,b,c,w)=>{ctx.strokeStyle=c;ctx.lineWidth=w;ctx.beginPath();ctx.moveTo(a[0],a[1]);ctx.lineTo(b[0],b[1]);ctx.stroke()};
    L2(bS,[bS[0]+A,fy-H*.03],col.ink,lw);
    L2(tS,hand,col.ink,lw);
    L2(bS,tS,col.court,lw*1.4);
    const hd=[(bS[0]+tS[0])/2,(bS[1]+tS[1])/2];
    ctx.setLineDash([4*k,4*k]);L2(hd,hand,col.muted,k);ctx.setLineDash([]);
    ctx.beginPath();ctx.arc(hd[0],hd[1],H*.075,0,2*Math.PI);ctx.fillStyle=col.panel;ctx.fill();ctx.strokeStyle=col.ink;ctx.lineWidth=lw*.5;ctx.stroke();
    ctx.beginPath();ctx.arc(hand[0],hand[1],H*.025,0,2*Math.PI);ctx.fillStyle=col.ball;ctx.fill();
    ctx.fillStyle=col.muted;ctx.font=`${11*k}px "Noto Sans TC",sans-serif`;ctx.textAlign='left';
    ctx.fillText('從頭頂方向看',8*k,16*k);ctx.textAlign='right';ctx.fillText('下半身疊住不動',W-8*k,fy+16*k);
  }};

const SETS={
  fh:[FH_SWING,THROW,CHOP,PALLOF,LUNGE,SINGLE,NINETY,OPENBOOK],
  bh:[BH_SWING,
      {...FH_SWING,name:'左手單手空揮',cue:'只用左手握拍（或拿毛巾），做左手的正手揮拍，從轉體一路做到收拍。',mirror:true},
      {...THROW,name:'藥球反手側拋',cue:'球放在左髖旁、右肩朝牆，重心壓左腳，右腳蹬地轉髖把球甩出去。',mirror:true},
      {...CHOP,name:'彈力帶伐木（反手向）',cue:'彈力帶固定在左下方，從左下拉到右上，力量從腿和髖開始。',mirror:true},
      PALLOF,
      {...LUNGE,name:'弓步轉體（往左）',cue:'右腳在前弓步蹲低，上半身往左轉再轉回來，模擬反手轉體。',base:{...LUNGE.base,ankR:[.15,.07,.45],ankL:[-.15,.12,-.45]}},
      NINETY,OPENBOOK]
};
const LIST=SETS[window.DRILL_SET]||SETS.fh;
const cards=LIST.map(ex=>{
  const d=document.createElement('div');d.className='drill';
  const cv=document.createElement('canvas');cv.setAttribute('role','img');cv.setAttribute('aria-label',ex.name+'示意動畫');
  const b=document.createElement('b');b.textContent=ex.name;const s=document.createElement('span');s.textContent=ex.cue;
  d.append(cv,b,s);root.append(d);return {ex,cv,vis:true};
});
if('IntersectionObserver' in window){const io=new IntersectionObserver(es=>es.forEach(e=>{const c=cards.find(c=>c.cv===e.target);if(c)c.vis=e.isIntersecting}));cards.forEach(c=>io.observe(c.cv))}
const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches,t0=performance.now();
function frame(now){
  const cs=getComputedStyle(document.documentElement),g=n=>cs.getPropertyValue(n).trim();
  const col={ink:g('--ink'),hip:g('--hip'),court:g('--court'),ball:g('--ball'),line:g('--line'),muted:g('--muted'),panel:g('--panel')};
  const t=(now-t0)/1000;
  cards.forEach(c=>{if(c.vis||reduce)render(c.cv,c.ex,reduce?c.ex.still:t,col)});
  if(!reduce)requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
if(reduce)addEventListener('resize',()=>requestAnimationFrame(frame));
})();
