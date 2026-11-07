/* ===== Quartier Soleil v5: the v4 roof model, own copy (Toit Soleil untouched), faster and returning its rectangles ===== */
function qsModel5(R,opt){opt=opt||{};
  const TT={},tk=k=>{const n=performance.now();TT[k]=(TT[k]||0)+n-TT._;TT._=n;};TT._=performance.now();const t0=performance.now(), raw=S.rawOrtho, MH=S.lidarR&&S.lidarR.mnh, Zl=R.Z; if(!MH||!Zl)return null;
  const rings=R.rings.map(r=>r.map(p=>[p.x+(opt.noShift?0:R.sh.dx),p.y+(opt.noShift?0:R.sh.dy)])); if(!rings.length)return null;
  const others=(R.others||[]).map(r=>r.map(p=>[p.x+(opt.noShift?0:R.sh.dx),p.y+(opt.noShift?0:R.sh.dy)]));
  const inPoly=(p,P)=>{let c=false;for(let i=0,j=P.length-1;i<P.length;j=i++){const a=P[i],b=P[j];if((a[1]>p[1])!=(b[1]>p[1])&&p[0]<(b[0]-a[0])*(p[1]-a[1])/(b[1]-a[1])+a[0])c=!c;}return c;};
  const segD=(x,y,q,r2)=>{const dx=r2[0]-q[0],dy=r2[1]-q[1],L2=dx*dx+dy*dy||1;let t=((x-q[0])*dx+(y-q[1])*dy)/L2;t=Math.max(0,Math.min(1,t));return Math.hypot(x-q[0]-t*dx,y-q[1]-t*dy);};
  const nearRing=(x,y,dm)=>rings.some(rg=>inPoly([x,y],rg)||rg.some((q,i)=>segD(x,y,q,rg[(i+1)%rg.length])<dm));
  const area=rings.reduce((a,rg)=>a+Math.abs(MK.area(rg)),0), ud=((RF.sel||S.building)||{}).userData||{}, big=opt.big!=null?opt.big:((ud.floors||0)>=3||(ud.h||0)>9.5||area>800);
  let rx0=1e9,rx1=-1e9,ry0=1e9,ry1=-1e9;rings.forEach(rg=>rg.forEach(p=>{rx0=Math.min(rx0,p[0]);rx1=Math.max(rx1,p[0]);ry0=Math.min(ry0,p[1]);ry1=Math.max(ry1,p[1]);}));
  const cx=(rx0+rx1)/2,cy=(ry0+ry1)/2;
  /* ground: laser minus height above ground, around the building */
  const zg=[];for(let x=rx0-1;x<=rx1+1;x+=1)for(let y=ry0-1;y<=ry1+1;y+=1){const z=Zl(x,y),h=MH.at(x,y);if(z!=null&&h!=null)zg.push(z-h);}if(!zg.length)return null;zg.sort((a,b)=>a-b);const Z0=zg[zg.length>>1];
  /* axis: directions of the roof slopes in the laser (mod 90°), the outline edges as a weak prior */
  const rb=new Array(90).fill(0);rings.forEach(rg=>rg.forEach((a,i)=>{const c=rg[(i+1)%rg.length];let g=Math.atan2(c[1]-a[1],c[0]-a[0])/RAD;g=((g%90)+90)%90;rb[Math.round(g)%90]+=Math.hypot(c[0]-a[0],c[1]-a[1]);}));
  const lb=new Array(90).fill(0);for(let x=rx0-1;x<=rx1+1;x+=0.5)for(let y=ry0-1;y<=ry1+1;y+=0.5){const z=Zl(x,y);if(z==null||z-Z0<2.5)continue;const a1=Zl(x+0.5,y),a0=Zl(x-0.5,y),b1=Zl(x,y+0.5),b0=Zl(x,y-0.5);if([a1,a0,b1,b0].some(v=>v==null))continue;const gx=a1-a0,gy=b1-b0,m=Math.hypot(gx,gy);if(m<0.25||m>2)continue;let g=Math.atan2(gy,gx)/RAD;g=((g%90)+90)%90;lb[Math.round(g)%90]+=1;}
  const tl=lb.reduce((s,v)=>s+v,0)||1,tr=rb.reduce((s,v)=>s+v,0)||1;const sm=lb.map((_,i)=>[-3,-2,-1,0,1,2,3].reduce((s,d)=>s+lb[(i+d+90)%90]/tl+(big?1:0.3)*rb[(i+d+90)%90]/tr,0));const ai=sm.indexOf(Math.max(...sm));
  const yA=sm[(ai+89)%90],yB=sm[ai],yC=sm[(ai+1)%90],dd=(yA-yC)/(2*(yA-2*yB+yC)||1);const Ad=((ai+(Math.abs(dd)<1?dd:0))%90)*RAD;
  const t=[Math.cos(Ad),Math.sin(Ad)],n=[-t[1],t[0]];const U=(x,y)=>x*t[0]+y*t[1],V=(x,y)=>x*n[0]+y*n[1],XY=(u,v)=>[u*t[0]+v*n[0],u*t[1]+v*n[1]];
  let u0=1e9,u1=-1e9,v0=1e9,v1=-1e9;const rUV=rings.map(rg=>rg.map(p=>[U(...p),V(...p)]));rUV.forEach(rg=>rg.forEach(p=>{u0=Math.min(u0,p[0]);u1=Math.max(u1,p[0]);v0=Math.min(v0,p[1]);v1=Math.max(v1,p[1]);}));u0-=2;u1+=2;v0-=2;v1+=2;
  const g=big?1.0:0.5;const NU=Math.round((u1-u0)/g),NV=Math.round((v1-v0)/g);const H=[];
  for(let i=0;i<NU;i++){H.push([]);for(let j=0;j<NV;j++){const [x,y]=XY(u0+(i+.5)*g,v0+(j+.5)*g);const z=Zl(x,y);let h=z==null?0:z-Z0;if(!nearRing(x,y,1.5)||(others.length&&!rings.some(rg=>inPoly([x,y],rg))&&others.some(rg=>inPoly([x,y],rg))))h=Math.min(h,0);else if(opt.green&&h>2&&opt.green(x,y)>12)h=NaN;H[i].push(h);}}
  /* foliage over a roof (green on the photo): unknown for the fit; elsewhere filled from its known neighbours */
  const HR=H.map(r=>r.slice());for(let i=0;i<NU;i++)for(let j=0;j<NV;j++){if(HR[i][j]===HR[i][j])continue;let s=0,c=0;for(let rr=1;rr<=4&&!c;rr++)for(let a=-rr;a<=rr;a++)for(let b=-rr;b<=rr;b++){const v=HR[i+a]&&HR[i+a][j+b];if(v!=null&&v===v){s+=v;c++;}}H[i][j]=c?s/c:0;}
  const mask=H.map(r=>r.map(h=>h>2?1:0)),maskD=(i,j)=>{for(let a=-2;a<=2;a++)for(let c=-2;c<=2;c++){const ii=i+a,jj=j+c;if(ii>=0&&jj>=0&&ii<NU&&jj<NV&&mask[ii][jj])return 1;}return 0;};
  tk('grid');
  const ST=opt.onStage,snap=ls=>ls.filter(l=>l.type!='none').map(l=>{const P=[];for(let a=0;a<=4;a++)for(let b=0;b<=4;b++){const u=l.R[0]+(l.R[1]-l.R[0])*a/4,v=l.R[2]+(l.R[3]-l.R[2])*b/4,[x,y]=XY(u,v);P.push(+x.toFixed(2),+y.toFixed(2),+(l.pred(u,v)+Z0).toFixed(2));}return P;});
  if(ST){try{const st=Math.max(1,Math.round(Math.sqrt(NU*NV/1400))),L=[];for(let i=0;i<NU;i+=st)for(let j=0;j<NV;j+=st){const h=H[i][j];if(!(h>1.5))continue;const [x,y]=XY(u0+(i+.5)*g,v0+(j+.5)*g);L.push(+x.toFixed(2),+y.toFixed(2),+(h+Z0).toFixed(2));}ST('laser',L);}catch(e){}}
  /* candidate lines */
  let cu=[],cv=[],off=[0,0];
  if(!big&&raw&&raw.raw){
    const W=raw.raw.width,Hh=raw.raw.height;let pd=null;try{pd=raw.raw.getContext('2d').getImageData(0,0,W,Hh).data;}catch(e){pd=null;}
    if(pd){const lum=(x,y)=>{const fx=(x-raw.w)/(raw.e-raw.w)*W-0.5,fy=(raw.n-y)/(raw.n-raw.s)*Hh-0.5;const i=Math.floor(fx),j=Math.floor(fy),a=fx-i,c=fy-j;if(i<0||j<0||i>=W-1||j>=Hh-1)return 0;const L=(ii,jj)=>{const k=(jj*W+ii)*4;return 0.3*pd[k]+0.59*pd[k+1]+0.11*pd[k+2];};return L(i,j)*(1-a)*(1-c)+L(i+1,j)*a*(1-c)+L(i,j+1)*(1-a)*c+L(i+1,j+1)*a*c;};
      const pgrad=(u,v)=>{const [xa,ya]=XY(u+0.2,v),[xb,yb]=XY(u-0.2,v),[xc,yc]=XY(u,v+0.2),[xd,yd]=XY(u,v-0.2);return Math.abs(lum(xa,ya)-lum(xb,yb))+Math.abs(lum(xc,yc)-lum(xd,yd));};
      /* photo / laser offset: laser edges against photo edges (centred weights) */
      const Gl=[];for(let i=1;i<NU-1;i++)for(let j=1;j<NV-1;j++){if(!maskD(i,j))continue;Gl.push([u0+(i+.5)*g,v0+(j+.5)*g,Math.min(Math.abs(H[i+1][j]-H[i-1][j])+Math.abs(H[i][j+1]-H[i][j-1]),4)]);}
      const mE=Gl.reduce((s,p)=>s+p[2],0)/(Gl.length||1);Gl.forEach(p=>p[2]-=mE);
      const sc=(du,dv,G)=>{let s=0;G.forEach(([u,v,e])=>{s+=e*pgrad(u+du,v+dv);});return s;};
      if(R._v4off&&R._v4off.ad===Ad)off=R._v4off.off.slice();else{
        const Gs=Gl.filter((_,k)=>k%3===0);let bo=-1e18;for(let du=-4;du<=4.01;du+=0.5)for(let dv=-4;dv<=4.01;dv+=0.5){const s=sc(du,dv,Gs);if(s>bo){bo=s;off=[du,dv];}}
        for(const stp of [0.25,0.1]){const c0=off.slice();bo=-1e18;for(let a=-2;a<=2;a++)for(let b=-2;b<=2;b++){const du=c0[0]+a*stp,dv=c0[1]+b*stp,s=sc(du,dv,Gl);if(s>bo){bo=s;off=[du,dv];}}}
        R._v4off={ad:Ad,off:off.slice()};}tk('offset');
      const lumUV=(u,v)=>{const [x,y]=XY(u+off[0],v+off[1]);return lum(x,y);};const pg=0.1,PU=Math.round((u1-u0)/pg),PV=Math.round((v1-v0)/pg);
      const prof=ax=>{const N1=ax=='u'?PU:PV,N2=ax=='u'?PV:PU,out=new Float64Array(N1);for(let i=2;i<N1-2;i++){let s=0,c=0;for(let j=0;j<N2;j+=2){const u=ax=='u'?u0+(i+.5)*pg:u0+(j+.5)*pg,v=ax=='u'?v0+(j+.5)*pg:v0+(i+.5)*pg;const gi=Math.min(NU-1,Math.floor((u-u0)/g)),gj=Math.min(NV-1,Math.floor((v-v0)/g));if(!maskD(gi,gj))continue;s+=ax=='u'?Math.abs(lumUV(u+0.15,v)-lumUV(u-0.15,v)):Math.abs(lumUV(u,v+0.15)-lumUV(u,v-0.15));c++;}out[i]=c?s:0;}return out;};
      const lprof=ax=>{const N1=ax=='u'?PU:PV,out=new Float64Array(N1);for(let i=0;i<N1;i++){const p=ax=='u'?u0+(i+.5)*pg:v0+(i+.5)*pg;let s=0;if(ax=='u'){const gi=Math.floor((p-u0)/g);if(gi<1||gi>=NU-1)continue;for(let j=0;j<NV;j++)s+=Math.abs(H[gi+1][j]-H[gi-1][j])>1?1:0;}else{const gj=Math.floor((p-v0)/g);if(gj<1||gj>=NV-1)continue;for(let k=0;k<NU;k++)s+=Math.abs(H[k][gj+1]-H[k][gj-1])>1?1:0;}out[i]=s;}return out;};
      const peaks=(arr,lo)=>{const N=arr.length,sv=new Float64Array(N);for(let i=2;i<N-2;i++)sv[i]=(arr[i-2]+2*arr[i-1]+3*arr[i]+2*arr[i+1]+arr[i+2])/9;let m=0,s=0,c=0;for(let i=0;i<N;i++)if(sv[i]>0){m+=sv[i];c++;}m/=c||1;for(let i=0;i<N;i++)if(sv[i]>0)s+=(sv[i]-m)**2;s=Math.sqrt(s/(c||1));const pk=[];for(let i=3;i<N-3;i++){if(sv[i]<m+0.6*s)continue;let ok=true;for(let d=-5;d<=5;d++)if(d&&sv[i+d]>sv[i])ok=false;if(ok)pk.push([lo+(i+.5)*pg,(sv[i]-m)/(s||1)]);}return pk;};
      /* slope breaks: where the laser changes slope without a step (eave of a pitched part against a flat one, a ridge, a lower pan) */
      const kprof=ax=>{const N1=ax=='u'?PU:PV,out=new Float64Array(N1);const kink=(a,b,c)=>{if(a<=2||b<=2||c<=2)return 0;const d1=b-a,d2=c-b;return Math.abs(d1)<1.5&&Math.abs(d2)<1.5&&Math.abs(d2-d1)>0.35?1:0;};
        for(let i=0;i<N1;i++){const p=ax=='u'?u0+(i+.5)*pg:v0+(i+.5)*pg;let s=0;if(ax=='u'){const gi=Math.floor((p-u0)/g);if(gi<2||gi>=NU-2)continue;for(let j=0;j<NV;j++)s+=kink(H[gi-2][j],H[gi][j],H[gi+2][j]);}else{const gj=Math.floor((p-v0)/g);if(gj<2||gj>=NV-2)continue;for(let k=0;k<NU;k++)s+=kink(H[k][gj-2],H[k][gj],H[k][gj+2]);}out[i]=s;}return out;};
      const nm=a=>{const mx=Math.max(...a)||1;return a.map(v=>v/mx);};const comb=ax=>{const p=nm(Array.from(prof(ax))),l=nm(Array.from(lprof(ax)));const k=opt.kinks?nm(Array.from(kprof(ax))):null;return p.map((v,i)=>v+0.8*l[i]+(k?0.8*k[i]:0));};
      const NK=opt.kinks?8:6;cu=peaks(comb('u'),u0).sort((a,b)=>b[1]-a[1]).slice(0,NK).map(p=>p[0]);cv=peaks(comb('v'),v0).sort((a,b)=>b[1]-a[1]).slice(0,NK).map(p=>p[0]);}}
  tk('profiles');rUV.forEach(rg=>rg.forEach(p=>{cu.push(p[0]);cv.push(p[1]);}));
  const dedupe=(arr,lo,hi,gap)=>{arr=arr.filter(x=>x>lo+0.5&&x<hi-0.5).sort((a,b)=>a-b);const out=[];arr.forEach(x=>{if(!out.length||x-out[out.length-1]>gap)out.push(x);});return [lo,...out,hi];};
  let CU=dedupe(cu,u0,u1,0.7),CV=dedupe(cv,v0,v1,0.7);for(let gp=1;(CU.length>10||CV.length>10)&&gp<4;gp+=0.5){CU=dedupe(cu,u0,u1,gp);CV=dedupe(cv,v0,v1,gp);}
  /* fitting */
  const pts=[];for(let i=0;i<NU;i++)for(let j=0;j<NV;j++)pts.push([u0+(i+.5)*g,v0+(j+.5)*g,HR[i][j]]);
  /* fitting on the grid itself (typed arrays, no per-point allocation): same models, same order, same solver as v4 */
  const PZ=new Float64Array(NU*NV);for(let i=0;i<NU;i++)for(let j=0;j<NV;j++)PZ[i*NV+j]=HR[i][j];
  const rngOf=Rc=>[Math.max(0,Math.ceil((Rc[0]-u0)/g-0.5)),Math.min(NU-1,Math.ceil((Rc[1]-u0)/g-0.5)-1),Math.max(0,Math.ceil((Rc[2]-v0)/g-0.5)),Math.min(NV-1,Math.ceil((Rc[3]-v0)/g-0.5)-1)];
  const ptsIn=Rc=>{const [i0,i1,j0,j1]=rngOf(Rc),out=[];for(let i=i0;i<=i1;i++)for(let j=j0;j<=j1;j++)out.push(pts[i*NV+j]);return out;};
  const solveN=(Mx,bb,np)=>{for(let i=0;i<np;i++)Mx[i][i]+=1e-6;const Mm=Mx.map((r,i)=>[...r,bb[i]]);for(let c=0;c<np;c++){let p=c;for(let r=c+1;r<np;r++)if(Math.abs(Mm[r][c])>Math.abs(Mm[p][c]))p=r;[Mm[c],Mm[p]]=[Mm[p],Mm[c]];for(let r=0;r<np;r++)if(r!=c&&Mm[c][c]){const f=Mm[r][c]/Mm[c][c];for(let q=c;q<=np;q++)Mm[r][q]-=f*Mm[c][q];}}return Mm.map((r,i)=>r[np]/r[i]);};
  const CL=0.6;
  const PRF={fit:0,cost:0,nLeaf:0,nFit:0,nCost:0};const fitM=(I,feat,np)=>{const _t=performance.now();PRF.nFit++;try{return fitM0(I,feat,np);}finally{PRF.fit+=performance.now()-_t;}};
  /* least squares of the laser over a rectangle (twice: the second time without the points more than 50 cm off).
     Flat typed arrays, no allocation per pass, and no second solve when the second pass kept every point (same sums, same result). */
  /* the features written out per kind (no closure per cell: the closures were megamorphic and slow); same expressions and
     same order of the sums as the generic version below, so the very same numbers */
  const fitK=(I,K,np)=>{const _t=performance.now();PRF.nFit++;try{return fitK0(I,K,np);}finally{PRF.fit+=performance.now()-_t;}};
  const fitK0=(I,K,np)=>{const t=K.t,a0=K.a,r=K.r,w0=K.w0,Rc=K.Rc;let M00,M01,M02,M11,M12,M22,B0,B1,B2;
    const pass=x=>{M00=M01=M02=M11=M12=M22=B0=B1=B2=0;let n=0;const x0=x?x[0]:0,x1=x?x[1]:0,x2=x&&np>2?x[2]:0;
      for(let i=I[0];i<=I[1];i++){const u=u0+(i+.5)*g,row=i*NV;for(let j=I[2];j<=I[3];j++){const z=PZ[row+j];if(z!==z)continue;const v=v0+(j+.5)*g;let f1,f2=0;
        if(t===0)f1=u-a0;else if(t===1)f1=v-a0;else if(t===2){f1=-Math.max(0,r-v);f2=-Math.max(0,v-r);}else if(t===3){f1=-Math.max(0,r-u);f2=-Math.max(0,u-r);}
        else{const d=Math.min(u-Rc[0],Rc[1]-u,v-Rc[2],Rc[3]-v);if(t===4)f1=d;else{f1=Math.min(d,w0);f2=Math.max(0,d-w0);}}
        if(x){let pz=0;pz+=1*x0;pz+=f1*x1;if(np>2)pz+=f2*x2;if(!(Math.abs(z-pz)<0.5))continue;}n++;
        B0+=1*z;M00+=1*1;M01+=1*f1;B1+=f1*z;M11+=f1*f1;if(np>2){M02+=1*f2;M12+=f1*f2;B2+=f2*z;M22+=f2*f2;}}}return n;};
    const sol=()=>np>2?solveN([[M00,M01,M02],[M01,M11,M12],[M02,M12,M22]],[B0,B1,B2],3):solveN([[M00,M01],[M01,M11]],[B0,B1],2);
    const n0=pass(null);let x=sol();const n1=pass(x);if(n1>np+3&&n1!==n0)x=sol();return x;};
  const fitM0=(I,feat,np)=>{const f=new Float64Array(np),M=new Float64Array(np*np),B=new Float64Array(np);
    const pass=x=>{M.fill(0);B.fill(0);let n=0;
      for(let i=I[0];i<=I[1];i++){const u=u0+(i+.5)*g,row=i*NV;for(let j=I[2];j<=I[3];j++){const z=PZ[row+j];if(z!==z)continue;const v=v0+(j+.5)*g;feat(u,v,f);
        if(x){let pz=0;for(let a=0;a<np;a++)pz+=f[a]*x[a];if(!(Math.abs(z-pz)<0.5))continue;}n++;
        for(let a=0;a<np;a++){const fa=f[a],o=a*np;B[a]+=fa*z;for(let c=0;c<np;c++)M[o+c]+=fa*f[c];}}}return n;};
    const sol=()=>{const Mx=[];for(let a=0;a<np;a++){const r=new Array(np);for(let c=0;c<np;c++)r[c]=M[a*np+c];Mx.push(r);}return solveN(Mx,Array.from(B),np);};
    const n0=pass(null);let x=sol();const n1=pass(x);if(n1>np+3&&n1!==n0)x=sol();return x;};
  const costI=(I,pred)=>{const _t=performance.now();PRF.nCost++;try{return costI0(I,pred);}finally{PRF.cost+=performance.now()-_t;}};
  /* the same per kind, written out: same expressions as each candidate's pred */
  const costK=(I,c,Rc)=>{const _t=performance.now();PRF.nCost++;try{return costK0(I,c,Rc);}finally{PRF.cost+=performance.now()-_t;}};
  const costK0=(I,c,Rc)=>{const T=c.type,x=c.x||[0,0,0],x0=x[0],x1=x[1],x2=x[2],r=c.r,w0=c.w0;let s=0;
    const t=T==='none'?-1:T==='flat'?5:T==='shedU'?0:T==='shedV'?1:T==='gableU'?2:T==='gableV'?3:T==='hip'?4:T==='mansard'?6:7;if(t===7)return costI0(I,c.pred);
    for(let i=I[0];i<=I[1];i++){const u=u0+(i+.5)*g;for(let j=I[2];j<=I[3];j++){const zz=PZ[i*NV+j];if(zz!==zz)continue;const v=v0+(j+.5)*g;let p;
      if(t===-1)p=0;else if(t===5)p=x0;else if(t===0)p=x0+x1*(u-Rc[0]);else if(t===1)p=x0+x1*(v-Rc[2]);
      else if(t===2)p=x0-x1*Math.max(0,r-v)-x2*Math.max(0,v-r);else if(t===3)p=x0-x1*Math.max(0,r-u)-x2*Math.max(0,u-r);
      else{const d=Math.min(u-Rc[0],Rc[1]-u,v-Rc[2],Rc[3]-v);p=t===4?x0+x1*d:x0+x1*Math.min(d,w0)+x2*Math.max(0,d-w0);}
      const dd=Math.abs(zz-p);s+=dd<CL?dd:CL;}}return s;};
  const costI0=(I,pred)=>{let s=0;for(let i=I[0];i<=I[1];i++){const u=u0+(i+.5)*g;for(let j=I[2];j<=I[3];j++){const zz=PZ[i*NV+j];if(zz!==zz)continue;const d=Math.abs(zz-pred(u,v0+(j+.5)*g));s+=d<CL?d:CL;}}return s;};
  const LFC=new Map();const leafFit=Rc=>{const key=Rc.map(v=>v.toFixed(2)).join(',');let r=LFC.get(key);if(!r){PRF.nLeaf++;r=leafFit0(Rc);LFC.set(key,r);}return r;};
  const leafFit0=Rc=>{const I=rngOf(Rc),none={type:'none',pred:()=>0,cost:0,cr:0,R:Rc,np:0};if(I[1]<I[0]||I[3]<I[2])return none;
    let nP=0,n2=0,zmax=-1e9;const hi=[];for(let i=I[0];i<=I[1];i++)for(let j=I[2];j<=I[3];j++){const z=PZ[i*NV+j];if(z!==z)continue;nP++;if(z>2)n2++;if(z>1)hi.push(z);if(z>zmax)zmax=z;}
    if(!nP)return none;const occ=n2/nP;const cands=[{type:'none',pred:()=>0,np:0}];
    if(occ>0.3){hi.sort((x,y)=>x-y);const md=hi.length?hi[hi.length>>1]:0;cands.push({type:'flat',x:[md],pred:()=>md,np:1});
      const su=fitK(I,{t:0,a:Rc[0]},2);cands.push({type:'shedU',x:su,pred:(u,v)=>su[0]+su[1]*(u-Rc[0]),np:2,k:Math.abs(su[1])});
      const sv=fitK(I,{t:1,a:Rc[2]},2);cands.push({type:'shedV',x:sv,pred:(u,v)=>sv[0]+sv[1]*(v-Rc[2]),np:2,k:Math.abs(sv[1])});
      const w=Rc[3]-Rc[2],l=Rc[1]-Rc[0];
      for(const fr of (big?[0.4,0.5,0.6]:[0.35,0.5,0.65])){const r=Rc[2]+fr*w,x=fitK(I,{t:2,r},3);if(x[1]>0.15&&x[2]>0.15&&x[1]<1.8&&x[2]<1.8)cands.push({type:'gableU',r,x,pred:(u,v)=>x[0]-x[1]*Math.max(0,r-v)-x[2]*Math.max(0,v-r),np:3});}
      for(const fr of (big?[0.4,0.5,0.6]:[0.35,0.5,0.65])){const r=Rc[0]+fr*l,x=fitK(I,{t:3,r},3);if(x[1]>0.15&&x[2]>0.15&&x[1]<1.8&&x[2]<1.8)cands.push({type:'gableV',r,x,pred:(u,v)=>x[0]-x[1]*Math.max(0,r-u)-x[2]*Math.max(0,u-r),np:3});}
      const dm=(u,v)=>Math.min(u-Rc[0],Rc[1]-u,v-Rc[2],Rc[3]-v);const hx=fitK(I,{t:4,Rc},2);if(hx[1]>0.15&&hx[1]<1.8)cands.push({type:'hip',x:hx,pred:(u,v)=>hx[0]+hx[1]*dm(u,v),np:2});
      if(big)for(const w0 of [0.8,1.2,1.6]){if(Math.min(w,l)<2*w0+1)continue;const x=fitK(I,{t:5,w0,Rc},3);if(x[1]>1.2&&x[1]<4&&x[2]>=0&&x[2]<0.8)cands.push({type:'mansard',w0,x,pred:(u,v)=>{const d=dm(u,v);return x[0]+x[1]*Math.min(d,w0)+x[2]*Math.max(0,d-w0);},np:3});}}
    const hmax=zmax+0.5;let best=null;
    cands.forEach(c=>{if((c.type=='shedU'||c.type=='shedV')&&c.k>1)return;if(c.type!='none'){let bad=false;[[Rc[0],Rc[2]],[Rc[1],Rc[2]],[Rc[0],Rc[3]],[Rc[1],Rc[3]],[(Rc[0]+Rc[1])/2,(Rc[2]+Rc[3])/2]].forEach(([u,v])=>{const z=c.pred(u,v);if(z>hmax||z<-0.5)bad=true;});if(bad)return;}
      const cr=costK(I,c,Rc),co=cr+0.15*c.np*Math.sqrt(nP);if(!best||co<best.cost)best={...c,cost:co,cr};});best.R=Rc;return best;};
  const LAM=(opt.lam||8)*(g*g/0.25)**0.5, memo=new Map(), tS=performance.now();
  const solve=(a,b,c,d)=>{const key=a+','+b+','+c+','+d;if(memo.has(key))return memo.get(key);const lf=leafFit([CU[a],CU[b],CV[c],CV[d]]);let best={cost:lf.cost+(lf.type=='none'?0:LAM),leaves:[lf]};
    if(performance.now()-tS<6000){
      for(let k=a+1;k<b;k++){if(CU[k]-CU[a]<1.2||CU[b]-CU[k]<1.2)continue;const L=solve(a,k,c,d),Rr=solve(k,b,c,d);if(L.cost+Rr.cost<best.cost)best={cost:L.cost+Rr.cost,leaves:[...L.leaves,...Rr.leaves]};}
      for(let k=c+1;k<d;k++){if(CV[k]-CV[c]<1.2||CV[d]-CV[k]<1.2)continue;const L=solve(a,b,c,k),Rr=solve(a,b,k,d);if(L.cost+Rr.cost<best.cost)best={cost:L.cost+Rr.cost,leaves:[...L.leaves,...Rr.leaves]};}}
    memo.set(key,best);return best;};
  let IX;
  if(big){ /* wings: greedy largest rectangles of the IGN outline, no search */
    const st=0.5,NU2=Math.ceil((u1-u0)/st),NV2=Math.ceil((v1-v0)/st),occ=[],used=[];let tot=0;
    for(let i=0;i<NU2;i++){occ.push(new Uint8Array(NV2));used.push(new Uint8Array(NV2));for(let j=0;j<NV2;j++){const o=rUV.some(rg=>inPoly([u0+(i+.5)*st,v0+(j+.5)*st],rg))?1:0;occ[i][j]=o;tot+=o;}}
    const rects=[];for(let it=0;it<6;it++){const hg=new Array(NV2).fill(0);let best=null;for(let i=0;i<NU2;i++){for(let j=0;j<NV2;j++)hg[j]=(occ[i][j]&&!used[i][j])?hg[j]+1:0;const stk=[];for(let j=0;j<=NV2;j++){const h=j<NV2?hg[j]:0;let start=j;while(stk.length&&stk[stk.length-1][1]>=h){const [sj,sh]=stk.pop();const ar=sh*(j-sj);if(!best||ar>best.ar)best={ar,i1:i,i0:i-sh+1,j0:sj,j1:j-1};start=sj;}stk.push([start,h]);}}
      if(!best||best.ar*st*st<12||(it>0&&best.ar<0.06*tot))break;for(let i=best.i0;i<=best.i1;i++)for(let j=best.j0;j<=best.j1;j++)used[i][j]=1;rects.push([u0+best.i0*st,u0+(best.i1+1)*st,v0+best.j0*st,v0+(best.j1+1)*st]);}
    if(!rects.length)return null;
    /* each wing is split along its length where the laser steps (a row of houses of different heights), chosen by a 1-D optimum */
    const Hat=(u,v)=>{const i=Math.floor((u-u0)/g),j=Math.floor((v-v0)/g);return (i>=0&&j>=0&&i<NU&&j<NV)?H[i][j]:0;};
    const segs=[];rects.forEach(r=>{const longU=(r[1]-r[0])>=(r[3]-r[2]),a=longU?r[0]:r[2],b=longU?r[1]:r[3],c0=longU?r[2]:r[0],c1=longU?r[3]:r[1];
      const cand=[a];for(let p=a+1.5;p<=b-1.5;p+=0.5){const st2=[];for(let q=c0+0.5;q<c1;q+=1){const d=longU?Math.abs(Hat(p+0.75,q)-Hat(p-0.75,q)):Math.abs(Hat(q,p+0.75)-Hat(q,p-0.75));st2.push(d);}st2.sort((x,y)=>x-y);const m=st2.length?st2[st2.length>>1]:0;if(m>0.8)cand.push([p,m]);}
      let cs=[a];cand.slice(1).forEach(([p,m])=>{const last=cs[cs.length-1];if(p-last<1.2){if(cs.length>1&&cs._m!=null&&m>cs._m){cs[cs.length-1]=p;cs._m=m;}}else{cs.push(p);cs._m=m;}});cs=cs.concat([b]);
      const mk=(x0,x1)=>longU?[x0,x1,r[2],r[3]]:[r[0],r[1],x0,x1];const nC=cs.length,best=new Array(nC).fill(1e18),from=new Array(nC).fill(-1);best[0]=0;
      for(let i=1;i<nC;i++)for(let j=0;j<i;j++){const lf=leafFit(mk(cs[j],cs[i]));const c=best[j]+lf.cost+LAM;if(c<best[i]){best[i]=c;from[i]=j;}}
      const parts=[];for(let i=nC-1;i>0;i=from[i])parts.push(mk(cs[from[i]],cs[i]));parts.forEach(q=>segs.push(q));});
    rects.length=0;segs.forEach(q=>rects.push(q));
    const eu=[...new Set(rects.flatMap(r=>[r[0],r[1]]).map(v=>+v.toFixed(3)))].sort((a,b)=>a-b),ev=[...new Set(rects.flatMap(r=>[r[2],r[3]]).map(v=>+v.toFixed(3)))].sort((a,b)=>a-b);
    CU=[u0,...eu.filter(v=>v>u0&&v<u1),u1];CV=[v0,...ev.filter(v=>v>v0&&v<v1),v1];
    IX=rects.map(r=>[CU.indexOf(+r[0].toFixed(3)),CU.indexOf(+r[1].toFixed(3)),CV.indexOf(+r[2].toFixed(3)),CV.indexOf(+r[3].toFixed(3))]);
  }else{const sol=solve(0,CU.length-1,0,CV.length-1);IX=sol.leaves.filter(l=>l.type!='none').map(l=>[CU.indexOf(l.R[0]),CU.indexOf(l.R[1]),CV.indexOf(l.R[2]),CV.indexOf(l.R[3])]);}
  tk('dp');if(!IX.length||IX.some(ix=>ix.some(k=>k<0)))return null;
  const inside=(Rc,u,v)=>u>=Rc[0]&&u<Rc[1]&&v>=Rc[2]&&v<Rc[3];
  const SAT=new Float64Array((NU+1)*(NV+1));for(let i=0;i<NU;i++)for(let j=0;j<NV;j++)SAT[(i+1)*(NV+1)+j+1]=(HR[i][j]===HR[i][j]?Math.min(Math.abs(HR[i][j]),CL):0)+SAT[i*(NV+1)+j+1]+SAT[(i+1)*(NV+1)+j]-SAT[i*(NV+1)+j];
  const c0In=Rc=>{const i0=Math.max(0,Math.ceil((Rc[0]-u0)/g-0.5)),i1=Math.min(NU-1,Math.ceil((Rc[1]-u0)/g-0.5)-1),j0=Math.max(0,Math.ceil((Rc[2]-v0)/g-0.5)),j1=Math.min(NV-1,Math.ceil((Rc[3]-v0)/g-0.5)-1);if(i1<i0||j1<j0)return 0;const W=NV+1;return SAT[(i1+1)*W+j1+1]-SAT[i0*W+j1+1]-SAT[(i1+1)*W+j0]+SAT[i0*W+j0];};
  const ALL=SAT[NU*(NV+1)+NV];
  const total=(A,B)=>{const ls=IX.map(ix=>leafFit([A[ix[0]],A[ix[1]],B[ix[2]],B[ix[3]]]));let s=ALL;ls.forEach(l=>{s+=l.cr-c0In(l.R);});return {s,ls};};
  const CUr=CU.slice(),CVr=CV.slice();let cur=total(CUr,CVr);if(ST)try{ST('rough',snap(cur.ls));}catch(e){}
  const refine=(onlyU,onlyV)=>{for(let pass=0;pass<(big?1:3);pass++){let imp=false;const uU=[...new Set(IX.flatMap(ix=>[ix[0],ix[1]]))],uV=[...new Set(IX.flatMap(ix=>[ix[2],ix[3]]))];
    for(const [arr,used,only] of [[CUr,uU,onlyU],[CVr,uV,onlyV]])for(const k of used){if(only&&!only.includes(k))continue;const base=arr[k];let bv=base,bs=cur.s;const us=used.slice().sort((p,q)=>p-q),pi=us.indexOf(k);
      for(let d=-0.8;d<=0.801;d+=(big?0.2:0.1)){const v=base+d;if(pi>0&&v<arr[us[pi-1]]+1)continue;if(pi<us.length-1&&v>arr[us[pi+1]]-1)continue;arr[k]=v;const c=total(CUr,CVr);if(c.s<bs-1e-6){bs=c.s;bv=v;}}
      arr[k]=bv;if(bv!==base){imp=true;cur=total(CUr,CVr);}}if(!imp)break;}};
  refine();tk('refine');if(ST)try{ST('refined',snap(cur.ls));}catch(e){}
  /* merge neighbours whose union is a rectangle when the simpler roof explains the laser as well */
  for(let it=0;it<6;it++){const base=cur.s+LAM*IX.length;let bm=null;
    for(let i=0;i<IX.length;i++)for(let j=i+1;j<IX.length;j++){const A=IX[i],B=IX[j];let Mx=null;
      if(A[0]==B[0]&&A[1]==B[1]&&(A[3]==B[2]||B[3]==A[2]))Mx=[A[0],A[1],Math.min(A[2],B[2]),Math.max(A[3],B[3])];else if(A[2]==B[2]&&A[3]==B[3]&&(A[1]==B[0]||B[1]==A[0]))Mx=[Math.min(A[0],B[0]),Math.max(A[1],B[1]),A[2],A[3]];if(!Mx)continue;
      const save=IX.slice(),sU=CUr.slice(),sV=CVr.slice(),sc=cur;IX.splice(j,1);IX[i]=Mx;cur=total(CUr,CVr);refine([Mx[0],Mx[1]],[Mx[2],Mx[3]]);const cc=cur.s+LAM*IX.length;
      if(cc<=base+0.5&&(!bm||cc<bm.cc))bm={cc,IX:IX.slice(),c:cur,U:CUr.slice(),V:CVr.slice()};
      IX.length=0;save.forEach(x=>IX.push(x));sU.forEach((v,q)=>CUr[q]=v);sV.forEach((v,q)=>CVr[q]=v);cur=sc;}
    if(!bm)break;IX.length=0;bm.IX.forEach(x=>IX.push(x));bm.U.forEach((v,q)=>CUr[q]=v);bm.V.forEach((v,q)=>CVr[q]=v);cur=bm.c;refine();}
  tk('merge');const leaves=cur.ls.filter(l=>l.type!='none'&&(l.R[1]-l.R[0])>=1&&(l.R[3]-l.R[2])>=1);if(!leaves.length)return null;if(ST)try{ST('merged',snap(leaves));}catch(e){}
  /* a shared garage roof (semi-detached): a low volume whose roof runs on, without a step, over the neighbour's footprint is one pitch.
     Both sides grow the same laser surface across the boundary and fit the same plane, so the two halves meet exactly. */
  if(others.length)try{const gs=0.5,kq=(x,y)=>Math.round(x/gs)+','+Math.round(y/gs),own=(x,y)=>rings.some(rg=>inPoly([x,y],rg)),oth=(x,y)=>others.some(rg=>inPoly([x,y],rg));
    leaves.forEach(l=>{const [a,b,c,d]=l.R;let top=-1e9;for(const [u,v] of [[a,c],[b,c],[a,d],[b,d],[(a+b)/2,(c+d)/2]])top=Math.max(top,l.pred(u,v));if(top>4.6||(b-a)*(d-c)>45)return;
      const [cxl,cyl]=XY((a+b)/2,(c+d)/2),seen=new Map(),Q=[];
      for(let u=a+0.25;u<b;u+=gs)for(let v=c+0.25;v<d;v+=gs){const [x0,y0]=XY(u,v),x=Math.round(x0/gs)*gs,y=Math.round(y0/gs)*gs,z=Zl(x,y);if(z==null||z-Z0<1.8||z-Z0>5)continue;const k=kq(x,y);if(!seen.has(k)){seen.set(k,[x,y,z]);Q.push([x,y,z]);}}
      for(let q=0;q<Q.length&&seen.size<900;q++){const [x,y,z]=Q[q];for(const [ex,ey] of [[gs,0],[-gs,0],[0,gs],[0,-gs]]){const X=x+ex,Y=y+ey,k=kq(X,Y);if(seen.has(k)||Math.hypot(X-cxl,Y-cyl)>8)continue;const Z=Zl(X,Y);if(Z==null||Math.abs(Z-z)>0.3||Z-Z0<1.8||Z-Z0>5)continue;if(!own(X,Y)&&!oth(X,Y))continue;seen.set(k,[X,Y,Z]);Q.push([X,Y,Z]);}}
      const P=[...seen.values()],nO=P.filter(([x,y])=>!own(x,y)&&oth(x,y)).length;if(nO*gs*gs<3||P.length<16)return;
      /* one plane, or one gable whose ridge crosses the party line (the ridge parallel to a wall): the best that explains the laser */
      const PU=P.map(([x,y,z])=>[U(x,y),V(x,y),z-Z0]);const ls3=(rows)=>{const M=[[0,0,0],[0,0,0],[0,0,0]],B=[0,0,0];rows.forEach(([f,z])=>{for(let i=0;i<3;i++){B[i]+=f[i]*z;for(let k=0;k<3;k++)M[i][k]+=f[i]*f[k];}});
        const d=M[0][0]*(M[1][1]*M[2][2]-M[1][2]*M[2][1])-M[0][1]*(M[1][0]*M[2][2]-M[1][2]*M[2][0])+M[0][2]*(M[1][0]*M[2][1]-M[1][1]*M[2][0]);if(Math.abs(d)<1e-9)return null;
        const sol=[0,1,2].map(c=>{const Mc=M.map((r,i)=>r.map((v,k)=>k===c?B[i]:v));return (Mc[0][0]*(Mc[1][1]*Mc[2][2]-Mc[1][2]*Mc[2][1])-Mc[0][1]*(Mc[1][0]*Mc[2][2]-Mc[1][2]*Mc[2][0])+Mc[0][2]*(Mc[1][0]*Mc[2][1]-Mc[1][1]*Mc[2][0]))/d;});
        let e=0;rows.forEach(([f,z])=>{e+=(z-sol[0]*f[0]-sol[1]*f[1]-sol[2]*f[2])**2;});return {sol,rms:Math.sqrt(e/rows.length)};};
      const fitAll=Q=>{let bs=null;const pl=ls3(Q.map(([u,v,z])=>[[1,u,v],z]));if(pl)bs={k:'plane',rms:pl.rms,sol:pl.sol};
        for(const ax of [0,1]){const ws=Q.map(p=>p[ax]);const w0=Math.min(...ws),w1=Math.max(...ws);for(let r=w0+1;r<=w1-1;r+=0.25){
          const g=ls3(Q.map(p=>[[1,Math.min(0,p[ax]-r),Math.max(0,p[ax]-r)],p[2]]));if(g&&g.sol[1]>0.05&&g.sol[2]<-0.05&&(!bs||g.rms<bs.rms-0.02))bs={k:'gable',ax,r,rms:g.rms,sol:g.sol};}}return bs;};
      const res=(bs,p)=>{const f=bs.k=='plane'?[1,p[0],p[1]]:[1,Math.min(0,p[bs.ax]-bs.r),Math.max(0,p[bs.ax]-bs.r)];return p[2]-bs.sol[0]*f[0]-bs.sol[1]*f[1]-bs.sol[2]*f[2];};
      /* robust: the edges mix wall and ground, a chimney, a gutter: fit, drop the far points, fit again */
      let best=fitAll(PU),QI=PU;for(let it=0;it<2&&best;it++){const lim=it?0.2:0.35;QI=PU.filter(p=>Math.abs(res(best,p))<lim);if(QI.length<Math.max(16,PU.length*0.65)){best=null;break;}best=fitAll(QI);}
      if(!best||best.rms>0.12)return; /* not one roof: two roofs, left as they are */
      /* the model is drawn moved back by the laser/cadastre shift of this building; a shared roof must sit where the laser is, the same for both neighbours */
      if(!opt.noShift){const su=U(R.sh.dx,R.sh.dy),sv=V(R.sh.dx,R.sh.dy);if(best.k=='plane')best.sol=[best.sol[0]-best.sol[1]*su-best.sol[2]*sv,best.sol[1],best.sol[2]];else best.r+=best.ax?sv:su;}
      if(best.k=='plane'){const pw=best.sol;l.type='shedU';l.x=[0,0];l.pw=pw;l.pred=(u,v)=>pw[0]+pw[1]*u+pw[2]*v;}
      else if(best.r<(best.ax?c:a)+0.3||best.r>(best.ax?d:b)-0.3){ /* the ridge lies outside this half: its one pitch */
        const [x0,k1,k2m]=best.sol,r=best.r,lo=best.r>(best.ax?d:b)-0.3,kk=lo?k1:k2m,c0=x0-kk*r,pw=best.ax?[c0,0,kk]:[c0,kk,0];l.type='shedU';l.x=[0,0];l.pw=pw;l.pred=(u,v)=>pw[0]+pw[1]*u+pw[2]*v;}
      else{const [x0,k1,k2m]=best.sol,r=best.r;delete l.pw;l.r=r;l.x=[x0,k1,-k2m];l.type=best.ax===1?'gableU':'gableV';
        l.pred=best.ax===1?((u,v)=>x0-k1*Math.max(0,r-v)+k2m*Math.max(0,v-r)):((u)=>x0-k1*Math.max(0,r-u)+k2m*Math.max(0,u-r));}l.shared=1;});}catch(e){}
  /* quality: median |laser - model| over the building */
  const ds=[];pts.forEach(p=>{const lf=leaves.find(l=>inside(l.R,p[0],p[1]));const m=lf?lf.pred(p[0],p[1]):0;const [x,y]=XY(p[0],p[1]);if(p[2]===p[2]&&(p[2]>2||m>2)&&nearRing(x,y,1))ds.push(Math.abs(p[2]-m));});ds.sort((a,b)=>a-b);
  const rms=ds.length?ds[ds.length>>1]:9;
  /* ---- the model in the page's format: pieces (outline + roofZ), pans (planes, tris on the energy grid), cells, verts */
  const s=R.s, cells=[], pans=[], verts=[], pieces=[];
  const faceSet=l=>{const [a,b,c,d]=l.R,p=l.pred,F=[];const q=pp=>F.push(pp.map(([u,v])=>[u,v,p(u,v)]));
    if(l.type=='flat'||l.type=='shedU'||l.type=='shedV')q([[a,c],[b,c],[b,d],[a,d]]);
    else if(l.type=='gableU'){q([[a,c],[b,c],[b,l.r],[a,l.r]]);q([[a,l.r],[b,l.r],[b,d],[a,d]]);}
    else if(l.type=='gableV'){q([[a,c],[l.r,c],[l.r,d],[a,d]]);q([[l.r,c],[b,c],[b,d],[l.r,d]]);}
    else if(l.type=='hip'||l.type=='mansard'){const ring=(R4,he,k)=>{const poly=[[R4[0],R4[2]],[R4[1],R4[2]],[R4[1],R4[3]],[R4[0],R4[3]]];const ccw=MK.area(poly)>0;
        const D=poly.map((A,i)=>{const B=poly[(i+1)%4],dx=B[0]-A[0],dy=B[1]-A[1],L=Math.hypot(dx,dy);let nx=-dy/L,ny=dx/L;if(!ccw){nx=-nx;ny=-ny;}return P=>(P[0]-A[0])*nx+(P[1]-A[1])*ny;});
        return poly.map((_,i)=>{let Q=poly.slice();for(let j=0;j<4;j++){if(j==i)continue;Q=MK.clipHalf(Q,P=>D[i](P)-D[j](P));if(Q.length<3)break;}return Q.length>=3?Q.map(P=>[P[0],P[1],he+k*D[i](P)]):null;}).filter(Boolean);};
      if(l.type=='hip')ring(l.R,l.x[0],l.x[1]).forEach(f=>F.push(f));
      else{const w0=l.w0,Ri=[a+w0,b-w0,c+w0,d-w0],hb=l.x[0]+l.x[1]*w0;ring(Ri,hb,l.x[2]).forEach(f=>F.push(f));
        const O=[[a,c],[b,c],[b,d],[a,d]],I=[[Ri[0],Ri[2]],[Ri[1],Ri[2]],[Ri[1],Ri[3]],[Ri[0],Ri[3]]];for(let i=0;i<4;i++){const j=(i+1)%4;F.push([[...O[i],l.x[0]],[...O[j],l.x[0]],[...I[j],hb],[...I[i],hb]]);}}}
    return F;};
  leaves.forEach((l,li)=>{const Puv=[[l.R[0],l.R[2]],[l.R[1],l.R[2]],[l.R[1],l.R[3]],[l.R[0],l.R[3]]];let P=Puv.map(([u,v])=>XY(u,v));if(MK.area(P)<0)P=P.reverse();
    const pc={P,v4:l.type,F:{best:{score:0,rms}},pans:[]};pc.roofZ=(x,y)=>l.pred(U(x,y),V(x,y))+Z0;pieces.push(pc);
    faceSet(l).forEach(f=>{const W3=f.map(([u,v,z])=>[...XY(u,v),z+Z0]);
      /* plane through the face: z = a x + b y + c */
      const [p0,p1,p2]=[W3[0],W3[1],W3[W3.length-1]];const e1=[p1[0]-p0[0],p1[1]-p0[1],p1[2]-p0[2]],e2=[p2[0]-p0[0],p2[1]-p0[1],p2[2]-p0[2]];let nr=[e1[1]*e2[2]-e1[2]*e2[1],e1[2]*e2[0]-e1[0]*e2[2],e1[0]*e2[1]-e1[1]*e2[0]];if(nr[2]<0)nr=nr.map(v=>-v);const ln=Math.hypot(...nr);if(ln<1e-9)return;nr=nr.map(v=>v/ln);if(nr[2]<0.05)return;
      const pa=-nr[0]/nr[2],pb=-nr[1]/nr[2],pcc=p0[2]-pa*p0[0]-pb*p0[1];let Q=W3.map(p=>[p[0],p[1]]);if(MK.area(Q)<0)Q=Q.reverse();if(Math.abs(MK.area(Q))<0.05)return;
      const tilt=Math.acos(nr[2]),az=((Math.atan2(nr[0],nr[1])/RAD)+360)%360,pan={id:pans.length,piece:li,Q,a:pa,b:pb,c:pcc,n:nr,tilt,az,flat:tilt<8*RAD,area:Math.abs(MK.area(Q))/Math.cos(tilt)};pan.small=pan.area<4;pans.push(pan);pc.pans.push(pan);
      const z=(x,y)=>pa*x+pb*y+pcc;let x0=1e9,x1=-1e9,y0=1e9,y1=-1e9;Q.forEach(([x,y])=>{x0=Math.min(x0,x);x1=Math.max(x1,x);y0=Math.min(y0,y);y1=Math.max(y1,y);});
      const i0=Math.floor(x0/s),i1=Math.ceil(x1/s),j0=Math.floor(y0/s),j1=Math.ceil(y1/s),node=new Map();
      const nodeAt=(i,j)=>{const key=i+','+j;let ci=node.get(key);if(ci==null){const x=i*s,y=j*s;ci=cells.length;cells.push({x,y,z:z(x,y),n:nr,tilt,az,pan:pan.id,w:0});node.set(key,ci);}return ci;};
      const half=[];for(let q=0;q<Q.length;q++){const A=Q[q],B=Q[(q+1)%Q.length];half.push(p=>-((B[0]-A[0])*(p[1]-A[1])-(B[1]-A[1])*(p[0]-A[0])));}
      pan.tris=[];
      for(let i=i0;i<i1;i++)for(let j=j0;j<j1;j++){let sq=[[i*s,j*s],[(i+1)*s,j*s],[(i+1)*s,(j+1)*s],[i*s,(j+1)*s]];for(const h of half){sq=MK.clipHalf(sq,h);if(sq.length<3)break;}if(sq.length<3)continue;
        const ar=Math.abs(MK.area(sq));if(ar<1e-6)continue;const ids=[nodeAt(i,j),nodeAt(i+1,j),nodeAt(i+1,j+1),nodeAt(i,j+1)];ids.forEach(ci=>cells[ci].w+=ar/4/(s*s));
        const Vv=sq.map(([x,y])=>{const uu=x/s-i,vv=y/s-j;return {x,y,z:z(x,y),ids,ws:[(1-uu)*(1-vv),uu*(1-vv),uu*vv,(1-uu)*vv]};});for(let q=1;q<Vv.length-1;q++)pan.tris.push(Vv[0],Vv[q],Vv[q+1]);}});});
  /* outlines along the walls (with the gable apex as a breakpoint), gables counted as vertical faces */
  const outerSeg=(pc,a,b)=>{const mx=(a[0]+b[0])/2,my=(a[1]+b[1])/2,L=Math.hypot(b[0]-a[0],b[1]-a[1]),ox=(b[1]-a[1])/L,oy=-(b[0]-a[0])/L;return !pieces.some(o=>o!==pc&&inPoly([mx+ox*0.3,my+oy*0.3],o.P));};
  pieces.forEach(pc=>{pc.edgeProfiles=[];const P=pc.P;for(let i=0;i<P.length;i++){const a=P[i],b=P[(i+1)%P.length],L=Math.hypot(b[0]-a[0],b[1]-a[1]);if(L<0.05)continue;
      const ts=[0,1];pc.pans.forEach(p=>p.Q.forEach(([x,y])=>{const tt=((x-a[0])*(b[0]-a[0])+(y-a[1])*(b[1]-a[1]))/(L*L),dist=Math.abs((x-a[0])*(b[1]-a[1])-(y-a[1])*(b[0]-a[0]))/L;if(dist<0.02&&tt>0.001&&tt<0.999)ts.push(tt);}));
      ts.sort((p,q)=>p-q);const prof=ts.map(tt=>{const x=a[0]+(b[0]-a[0])*tt,y=a[1]+(b[1]-a[1])*tt;return [x,y,pc.roofZ(x,y)];});const outer=outerSeg(pc,a,b);pc.edgeProfiles.push({a,b,prof,outer});
      if(!outer)continue;const zm=Math.min(...prof.map(p=>p[2]));if(Math.max(...prof.map(p=>p[2]))-zm<0.6)continue;
      const quads=[];for(let k=0;k<prof.length-1;k++){const p=prof[k],q=prof[k+1];if(p[2]-zm<0.02&&q[2]-zm<0.02)continue;quads.push([[p[0],p[1],zm],[q[0],q[1],zm],[q[0],q[1],q[2]],[p[0],p[1],p[2]]]);}
      let ar=0,mx=0,my=0,mz=0;quads.forEach(q=>{const w=Math.hypot(q[1][0]-q[0][0],q[1][1]-q[0][1])*((q[2][2]-q[1][2])+(q[3][2]-q[0][2]))/2;ar+=w;mx+=(q[0][0]+q[1][0])/2*w;my+=(q[0][1]+q[1][1])/2*w;mz+=(q[0][2]+q[3][2]+q[1][2]+q[2][2])/4*w;});
      if(ar<1)continue;const nx=(b[1]-a[1])/L,ny=-(b[0]-a[0])/L;verts.push({quads,a:ar,x:mx/ar+nx*0.3,y:my/ar+ny*0.3,z:mz/ar,n:[nx,ny,0],tilt:Math.PI/2,az:((Math.atan2(nx,ny)/RAD)+360)%360});}});
  tk("out");delete TT._;return {pieces,pans,cells,verts,rms,TT,PRF,L5:{leaves,XY,U,V,Z0,Ad,faceSet},v4:{big,ms:Math.round(performance.now()-t0),types:leaves.map(l=>l.type),axis:Ad/RAD,off}};}


