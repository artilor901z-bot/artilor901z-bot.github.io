var e=(e,t)=>{let n=/^#([0-9a-f]{6})$/i.exec(e.trim());if(!n)return t;let r=parseInt(n[1],16);return[(r>>16)/255,(r>>8&255)/255,(r&255)/255]};function t(t,n){let r=n.getContext(`webgl`,{antialias:!1,alpha:!1,powerPreference:`low-power`});if(!r)return()=>{};let i=(e,t)=>{let n=r.createShader(e);return r.shaderSource(n,t),r.compileShader(n),n},a=r.createProgram();if(r.attachShader(a,i(r.VERTEX_SHADER,`attribute vec2 a;void main(){gl_Position=vec4(a,0.,1.);}`)),r.attachShader(a,i(r.FRAGMENT_SHADER,`
precision highp float;
uniform vec2 u_res;
uniform float u_time;
uniform float u_in;
uniform vec3 u_pts[18];
uniform vec3 u_paper;
uniform vec3 u_ink;
uniform vec3 u_red;
float hash(vec2 p){ p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }
float noise(vec2 p){
  vec2 i = floor(p), f = fract(p);
  f = f * f * (3. - 2. * f);
  return mix(mix(hash(i), hash(i + vec2(1., 0.)), f.x), mix(hash(i + vec2(0., 1.)), hash(i + vec2(1., 1.)), f.x), f.y);
}
float fbm(vec2 p){
  float v = 0., a = .5;
  for (int i = 0; i < 5; i++) { v += a * noise(p); p = p * 2.03 + 17.1; a *= .5; }
  return v;
}
void main(){
  vec2 uv = gl_FragCoord.xy / u_res;
  float asp = u_res.x / u_res.y;
  vec2 p = vec2(uv.x * asp, uv.y);
  float t = u_time * .028;
  // 两层互相扭曲的噪声：像水在纸上慢慢带着墨走
  vec2 q = vec2(fbm(p * 1.5 + t), fbm(p * 1.5 - t + 5.2));
  float n = fbm(p * 1.2 + q * 1.5 + vec2(t * .6, -t));
  float wash = smoothstep(.34, .66, n);
  // 墨干了以后留在边缘的那一圈深色
  float rim = smoothstep(.035, 0., abs(n - .5)) * .5 + smoothstep(.02, 0., abs(n - .6)) * .35;
  // 右边（立绘那侧）墨重，左边（文字那侧）留白
  float side = mix(.38, 1., smoothstep(.1, .9, uv.x));
  float ink = (wash * .4 + rim * .14) * side * u_in;
  // 鼠标留下的水痕：边缘被细噪声咬成不规则的形状，越老越大越淡
  float grainy = fbm(p * 7. + 3.);
  float tr = 0.;
  for (int i = 0; i < 18; i++) {
    vec3 P = u_pts[i];
    if (P.z <= 0.) continue;
    float r = .035 + .12 * (1. - P.z);
    float d = length(p - vec2(P.x * asp, P.y)) + (grainy - .5) * .09;
    tr = max(tr, smoothstep(r, r * .3, d) * P.z);
  }
  vec3 col = mix(u_paper, u_ink, ink);
  col = mix(col, u_red, tr * .5);
  // 纸的颗粒
  col -= (hash(gl_FragCoord.xy) - .5) * .022;
  gl_FragColor = vec4(col, 1.);
}`)),r.linkProgram(a),!r.getProgramParameter(a,r.LINK_STATUS))return console.error(`ink shader: `+r.getProgramInfoLog(a)),()=>{};r.useProgram(a),r.bindBuffer(r.ARRAY_BUFFER,r.createBuffer()),r.bufferData(r.ARRAY_BUFFER,new Float32Array([-1,-1,3,-1,-1,3]),r.STATIC_DRAW);let o=r.getAttribLocation(a,`a`);r.enableVertexAttribArray(o),r.vertexAttribPointer(o,2,r.FLOAT,!1,0,0);let s=e=>r.getUniformLocation(a,e),c=s(`u_res`),l=s(`u_time`),u=s(`u_in`),d=s(`u_pts`),f=getComputedStyle(document.documentElement);r.uniform3fv(s(`u_paper`),e(f.getPropertyValue(`--bg`),[.93,.94,.93])),r.uniform3fv(s(`u_ink`),e(f.getPropertyValue(`--fg`),[.06,.07,.09])),r.uniform3fv(s(`u_red`),e(f.getPropertyValue(`--accent`),[.84,.12,.22]));let p=.6,m=()=>{let e=Math.max(2,Math.round(n.clientWidth*p)),t=Math.max(2,Math.round(n.clientHeight*p));(n.width!==e||n.height!==t)&&(n.width=e,n.height=t,r.viewport(0,0,e,t)),r.uniform2f(c,e,t)},h=new Float32Array(54),g=0,_=-1,v=-1,y=e=>{let t=n.getBoundingClientRect(),r=(e.clientX-t.left)/t.width,i=1-(e.clientY-t.top)/t.height;Math.hypot((r-_)*(t.width/t.height),i-v)<.045||(_=r,v=i,h.set([r,i,1],g*3),g=(g+1)%18)};t.addEventListener(`pointermove`,y);let b=0,x=!0,S=performance.now(),C=Math.random()*400,w=0,T=e=>{b=0;let t=Math.min(.05,(e-S)/1e3);S=e,C+=t,document.documentElement.classList.contains(`intro-done`)&&(w=Math.min(1,w+t/2.6));for(let e=0;e<18;e++)h[e*3+2]=Math.max(0,h[e*3+2]-t/2.8);m(),r.uniform1f(l,C),r.uniform1f(u,w*w*(3-2*w)),r.uniform3fv(d,h),r.drawArrays(r.TRIANGLES,0,3),n.classList.add(`is-live`),x&&!document.hidden&&(b=requestAnimationFrame(T))},E=()=>{!b&&x&&!document.hidden&&(S=performance.now(),b=requestAnimationFrame(T))},D=new IntersectionObserver(([e])=>{x=e.isIntersecting,E()});return D.observe(t),document.addEventListener(`visibilitychange`,E),E(),()=>{cancelAnimationFrame(b),D.disconnect(),t.removeEventListener(`pointermove`,y),document.removeEventListener(`visibilitychange`,E),r.getExtension(`WEBGL_lose_context`)?.loseContext()}}var n;document.addEventListener(`astro:page-load`,()=>{n?.(),n=void 0;let e=document.querySelector(`.hero`);if(!e||matchMedia(`(prefers-reduced-motion: reduce)`).matches)return;let r=e.querySelector(`canvas.ink`),i=r?t(e,r):()=>{},a=t=>{e.style.setProperty(`--mx`,(t.clientX/innerWidth*2-1).toFixed(3)),e.style.setProperty(`--my`,(t.clientY/innerHeight*2-1).toFixed(3))},o=()=>{scrollY<innerHeight*1.2&&e.style.setProperty(`--sy`,Math.min(1,scrollY/innerHeight).toFixed(3))};e.addEventListener(`pointermove`,a),addEventListener(`scroll`,o,{passive:!0}),n=()=>{i(),e.removeEventListener(`pointermove`,a),removeEventListener(`scroll`,o)}}),document.addEventListener(`astro:before-swap`,()=>{n?.(),n=void 0});