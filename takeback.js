// Takeback (引拍) animations for the forehand / backhand pages.
// Each <canvas data-tb="fh-back|fh-top|bh-back|bh-top"> gets a looping 120x100-unit scene; the caption goes to the sibling .tb-step.
(function(){
const R=Math.PI/180;
const lerp=(A,B,u)=>typeof A==='number'?A+(B-A)*u:Array.isArray(A)?A.map((x,i)=>lerp(x,B[i],u)):Object.fromEntries(Object.keys(A).map(k=>[k,lerp(A[k],B[k],u)]));
function ik(A,B,l1,l2,sg){const dx=B[0]-A[0],dy=B[1]-A[1],d=Math.hypot(dx,dy)||1,ux=dx/d,uy=dy/d,dd=Math.min(d,l1+l2-.01),a=(l1*l1-l2*l2+dd*dd)/(2*dd),h=Math.sqrt(Math.max(0,l1*l1-a*a));return [A[0]+ux*a-uy*h*sg,A[1]+uy*a+ux*h*sg]}
function joints(p){
  const tx=p.nk[0]-p.pv[0],ty=p.nk[1]-p.pv[1],tl=Math.hypot(tx,ty),ux=tx/tl,uy=ty/tl,px=-uy,py=ux,off=(o,k)=>[o[0]+px*k,o[1]+py*k];
  const sA=off(p.nk,-p.s),sB=off(p.nk,p.s),hA=off(p.pv,-p.h),hB=off(p.pv,p.h);
  return {sA,sB,hA,hB,nk:p.nk,pv:p.pv,hd:[p.nk[0]+ux*9,p.nk[1]+uy*9],fA:p.fA,fB:p.fB,wA:p.wA,wB:p.wB,
    kA:ik(hA,p.fA,21,21,p.kb[0]),kB:ik(hB,p.fB,21,21,p.kb[1]),eA:ik(sA,p.wA,14,14,p.eb[0]),eB:ik(sB,p.wB,14,14,p.eb[1])};
}
const pl=(x,...q)=>{x.beginPath();q.forEach((p,i)=>i?x.lineTo(p[0],p[1]):x.moveTo(p[0],p[1]));x.stroke()};
const circ=(x,p,r,fill,stroke)=>{x.beginPath();x.arc(p[0],p[1],r,0,7);if(fill){x.fillStyle=fill;x.fill()}if(stroke){x.strokeStyle=stroke;x.stroke()}};
const txt=(x,s,p,c,al='center',sz=5)=>{x.fillStyle=c.muted;x.font=`${sz}px "Noto Sans TC",sans-serif`;x.textAlign=al;x.fillText(s,p[0],p[1])};
const head=(w,a)=>[w[0]+Math.cos(a*R)*12.5,w[1]+Math.sin(a*R)*12.5];
function fig(x,J,c){
  x.strokeStyle=c.ink;x.lineWidth=2.6;pl(x,J.hA,J.kA,J.fA);pl(x,J.hB,J.kB,J.fB);pl(x,J.pv,J.nk);pl(x,J.sA,J.eA,J.wA);pl(x,J.sB,J.eB,J.wB);
  x.lineWidth=3.6;x.strokeStyle=c.hip;pl(x,J.hA,J.hB);x.strokeStyle=c.court;pl(x,J.sA,J.sB);
  x.lineWidth=2;circ(x,J.hd,6,c.panel,c.ink);
}
function paddle(x,w,a,c){const h=head(w,a);x.strokeStyle=c.ink;x.save();x.translate(w[0],w[1]);x.rotate(a*R);x.lineWidth=3.2;pl(x,[-1,0],[6,0]);x.lineWidth=1.6;x.beginPath();x.roundRect(6,-5.2,13,10.4,3.5);x.globalAlpha=.3;x.fillStyle=c.court;x.fill();x.globalAlpha=1;x.stroke();x.restore()}

// back view, right-handed player seen from behind (their right = screen right)
const BACK={pv:[60,57],nk:[60,29],s:10,h:7,fA:[46,92],fB:[74,92],kb:[1,-1],eb:[1,-1],wA:[57,47],wB:[64,46],rk:-90};
const S={
  'fh-back':{keys:[
    {p:{...BACK},hold:.5,dur:.6,label:'準備：拍子在胸前，拍頭朝上'},
    {p:{s:3,h:6,nk:[62,29],wA:[70,42],wB:[78,44],rk:-75},dur:.5,hold:.6,label:'① 看到球就轉身，左手扶著拍喉把拍子帶到後面'},
    {p:{wA:[54,40],wB:[82,40],rk:-60},dur:.35,hold:.5,label:'② 左手放開指向來球，拍頭高於手腕'},
    {p:{pv:[60,59],nk:[61,31],wB:[76,56],rk:80},dur:.35,hold:.15,label:'③ 拍頭落到比球低（小迴圈）'},
    {p:{s:10,h:7,pv:[58,57],nk:[58,29],wA:[48,46],wB:[86,46],rk:-10},dur:.22,hold:.3,label:'④ 由低往高揮出'},
    {p:{s:4,wA:[46,34],wB:[48,28],rk:-120},dur:.35,hold:.5,label:'⑤ 收拍到左肩'}]},
  'bh-back':{keys:[
    {p:{...BACK,wA:[58,44],wB:[62,46]},hold:.5,dur:.6,label:'準備：雙手握拍在胸前'},
    {p:{s:3,h:5,nk:[58,29],wA:[42,42],wB:[44,46],rk:-105},dur:.5,hold:.6,label:'① 轉身帶拍到左側，下巴靠近右肩'},
    {p:{pv:[60,60],nk:[59,32],wA:[45,50],wB:[46,54],rk:100},dur:.4,hold:.2,label:'② 拍頭落到球的下方'},
    {p:{s:5,h:7,pv:[60,57],nk:[60,29],wA:[45,44],wB:[48,48],rk:-170},dur:.22,hold:.3,label:'③ 由低往高，在左前方擊球'},
    {p:{s:6,wA:[72,24],wB:[74,26],rk:-40},dur:.35,hold:.5,label:'④ 收拍到右肩上方'}]},
};
for(const d of Object.values(S)){
  let prev={};d.keys.forEach(k=>{k.p=prev={...prev,...k.p}});
  let tot=0;d.seg=[];
  d.keys.forEach((k,i)=>{if(i){d.seg.push([i-1,i,tot,k.dur]);tot+=k.dur}d.seg.push([i,i,tot,k.hold||0]);tot+=k.hold||0});
  d.seg.push([d.keys.length-1,0,tot,d.keys[0].dur]);d.T=tot+d.keys[0].dur;
  d.still=(d.keys[0].hold||0)+d.keys[1].dur+.3;
}
function sample(d,t){t=((t%d.T)+d.T)%d.T;const s=d.seg.find(s=>t<s[2]+s[3])||d.seg[d.seg.length-1];let u=s[3]?(t-s[2])/s[3]:1;u=u*u*(3-2*u);return {p:lerp(d.keys[s[0]].p,d.keys[s[1]].p,u),label:d.keys[s[1]].label}}
function drawBack(x,d,t,c){
  x.strokeStyle=c.line;x.lineWidth=.8;pl(x,[2,93],[118,93]);
  // paddle-head trail over the last 0.6 s shows the loop
  let prev=null;for(let i=0;i<=30;i++){const s=sample(d,t-i*.02),h=head(s.p.wB,s.p.rk);if(prev){x.globalAlpha=(1-i/31)*.8;x.strokeStyle=c.ball;x.lineWidth=2.4;pl(x,prev,h)}prev=h}x.globalAlpha=1;
  const S0=sample(d,t);fig(x,joints(S0.p),c);paddle(x,S0.p.wB,S0.p.rk,c);
  txt(x,'從背後看（右手持拍）',[116,8],c,'right');return S0.label;
}

// top view: player facing the net (up). a = shoulder turn in degrees, + = to the right
function drawTop(x,t,c,side){
  const C=[60,62],T=7.2;t=((t%T)+T)%T;
  const ease=u=>{u=Math.max(0,Math.min(1,u));return u*u*(3-2*u)};
  let a,lab,full;
  if(t<3.6){full=0;a=45*(t<.6?ease(t/.6):t<2.6?1:1-ease((t-2.6)/.6));lab=side>0?'快球、網前：短引拍，肩轉約 45°，拍子在身體側面':'快球、網前：只轉肩，拍子在左髖旁'}
  else{const u=t-3.6;full=1;a=90*(u<.7?ease(u/.7):u<2.7?1:1-ease((u-2.7)/.7));lab=side>0?'慢球、底線：完整引拍，肩轉約 90°，拍子到身體後方':'慢球、底線：肩轉約 90°，拍子到左後方'}
  a*=side;const r=a*R,right=[Math.cos(r),Math.sin(r)],fwd=[Math.sin(r),-Math.cos(r)];
  const P=(hr,hf)=>[C[0]+right[0]*hr+fwd[0]*hf,C[1]+right[1]*hr+fwd[1]*hf];
  x.strokeStyle=c.muted;x.lineWidth=.6;x.save();x.setLineDash([2,2]);pl(x,[14,C[1]],[106,C[1]]);x.restore();txt(x,'身體正面那條線',[106,C[1]-2],c,'right',4);
  txt(x,'↑ 球網',[60,8],c);
  const k=Math.abs(a)/90,hand=side>0?P(16-2*k,10-22*k):P(-16+2*k,10-20*k);
  const pd=[-fwd[0]*.9+right[0]*.4*side,-fwd[1]*.9+right[1]*.4*side],pn=Math.hypot(...pd),dir=[pd[0]/pn,pd[1]/pn];
  const turn=k,pdir=[fwd[0]*(1-turn)+dir[0]*turn,fwd[1]*(1-turn)+dir[1]*turn],pm=Math.hypot(...pdir)||1,pu=[pdir[0]/pm,pdir[1]/pm];
  const hr=a*.5*R,hip=[Math.cos(hr)*9,Math.sin(hr)*9];
  x.lineWidth=3.6;x.strokeStyle=c.hip;pl(x,[C[0]-hip[0],C[1]-hip[1]],[C[0]+hip[0],C[1]+hip[1]]);
  const sR=P(14,0),sL=P(-14,0);x.strokeStyle=c.court;pl(x,sL,sR);
  x.strokeStyle=c.ink;x.lineWidth=2.4;
  if(side>0){pl(x,sR,hand);pl(x,sL,full?P(-6,16):[(hand[0]+sL[0])/2+fwd[0]*6,(hand[1]+sL[1])/2+fwd[1]*6])}
  else{pl(x,sR,hand);pl(x,sL,hand)}
  const ph=[hand[0]+pu[0]*14,hand[1]+pu[1]*14];x.lineWidth=2;pl(x,hand,[hand[0]+pu[0]*7,hand[1]+pu[1]*7]);
  x.save();x.translate(ph[0],ph[1]);x.rotate(Math.atan2(pu[1],pu[0]));x.beginPath();x.roundRect(-6.5,-4,13,8,2.6);x.globalAlpha=.3;x.fillStyle=c.court;x.fill();x.globalAlpha=1;x.stroke();x.restore();
  x.lineWidth=1.6;circ(x,C,6,c.panel,c.ink);
  txt(x,`肩 ${Math.round(Math.abs(a))}°`,[C[0],96],c,'center',5);
  txt(x,'俯視',[116,8],c,'right');return lab;
}

const items=[...document.querySelectorAll('canvas[data-tb]')].map(cv=>({cv,id:cv.dataset.tb,step:cv.parentElement.querySelector('.tb-step')}));
if(!items.length)return;
const still=matchMedia('(prefers-reduced-motion: reduce)').matches,t0=performance.now();
function tick(now){
  const cs=getComputedStyle(document.documentElement),g=n=>cs.getPropertyValue(n).trim();
  const c={ink:g('--ink'),hip:g('--hip'),court:g('--court'),ball:g('--ball'),line:g('--line'),muted:g('--muted'),panel:g('--panel')};
  for(const it of items){
    const r=it.cv.getBoundingClientRect();if(r.bottom<0||r.top>innerHeight||!r.width)continue;
    const k=window.devicePixelRatio||1,W=Math.round(r.width*k),H=Math.round(r.height*k);
    if(it.cv.width!==W||it.cv.height!==H){it.cv.width=W;it.cv.height=H}
    const x=it.cv.getContext('2d');x.setTransform(1,0,0,1,0,0);x.clearRect(0,0,W,H);x.setTransform(W/120,0,0,W/120,0,0);x.lineCap='round';x.lineJoin='round';
    const t=(now-t0)/1000;let label;
    if(it.id.endsWith('-back')){const d=S[it.id];label=drawBack(x,d,still?d.still:t,c)}
    else label=drawTop(x,still?1.5:t,c,it.id.startsWith('fh')?1:-1);
    if(it.step&&it.step.textContent!==label)it.step.textContent=label;
  }
  requestAnimationFrame(tick);
}
requestAnimationFrame(tick);
})();
