function rk4Step(x1, x2, dt, a, b){
  const f1 = (y1, y2) => y2;
  const f2 = (y1, y2) => -a * Math.sin(y1) - b * y2;

  const k11 = f1(x1, x2);
  const k21 = f2(x1, x2);

  const k12 = f1(x1 + 0.5*dt*k11, x2 + 0.5*dt*k21);
  const k22 = f2(x1 + 0.5*dt*k11, x2 + 0.5*dt*k21);

  const k13 = f1(x1 + 0.5*dt*k12, x2 + 0.5*dt*k22);
  const k23 = f2(x1 + 0.5*dt*k12, x2 + 0.5*dt*k22);

  const k14 = f1(x1 + dt*k13, x2 + dt*k23);
  const k24 = f2(x1 + dt*k13, x2 + dt*k23);

  const nx1 = x1 + (dt/6) * (k11 + 2*k12 + 2*k13 + k14);
  const nx2 = x2 + (dt/6) * (k21 + 2*k22 + 2*k23 + k24);

  return [nx1, nx2];
}

export async function mount(container){
  const wrap = document.createElement("div");
  wrap.style.marginTop = "10px";

  const row = document.createElement("div");
  row.style.display = "flex";
  row.style.gap = "10px";
  row.style.alignItems = "center";
  row.style.flexWrap = "wrap";

  const makeSlider = (label, min, max, step, value)=>{
    const box = document.createElement("div");
    box.style.display = "flex";
    box.style.gap = "8px";
    box.style.alignItems = "center";

    const t = document.createElement("div");
    t.textContent = label;
    t.style.opacity = "0.85";
    t.style.fontSize = "12px";

    const s = document.createElement("input");
    s.type = "range";
    s.min = String(min);
    s.max = String(max);
    s.step = String(step);
    s.value = String(value);

    const v = document.createElement("div");
    v.textContent = String(value);
    v.style.width = "44px";
    v.style.textAlign = "right";
    v.style.fontSize = "12px";
    v.style.opacity = "0.85";

    s.addEventListener("input", ()=>{
      v.textContent = s.value;
    });

    box.appendChild(t);
    box.appendChild(s);
    box.appendChild(v);
    return { box, slider: s };
  };

  const sa = makeSlider("a", 0.5, 5.0, 0.1, 2.0);
  const sb = makeSlider("b", 0.0, 2.0, 0.05, 0.4);

  const resetBtn = document.createElement("button");
  resetBtn.textContent = "reset";
  resetBtn.style.border = "1px solid rgba(255,211,122,.55)";
  resetBtn.style.background = "rgba(255,211,122,.10)";
  resetBtn.style.color = "inherit";
  resetBtn.style.borderRadius = "10px";
  resetBtn.style.padding = "6px 10px";
  resetBtn.style.cursor = "pointer";

  row.appendChild(sa.box);
  row.appendChild(sb.box);
  row.appendChild(resetBtn);

  const canvas = document.createElement("canvas");
  canvas.width = 520;
  canvas.height = 360;
  canvas.style.width = "100%";
  canvas.style.maxWidth = "720px";
  canvas.style.border = "1px solid rgba(255,255,255,.08)";
  canvas.style.borderRadius = "12px";
  canvas.style.marginTop = "10px";

  wrap.appendChild(row);
  wrap.appendChild(canvas);
  container.appendChild(wrap);

  const ctx = canvas.getContext("2d");

  const world = {
    x1Min: -Math.PI,
    x1Max: Math.PI,
    x2Min: -4.0,
    x2Max: 4.0
  };

  function toCanvas(x1, x2){
    const u = (x1 - world.x1Min) / (world.x1Max - world.x1Min);
    const v = (x2 - world.x2Min) / (world.x2Max - world.x2Min);
    return [u * canvas.width, (1 - v) * canvas.height];
  }

  let seeds = [];
  function reseed(){
    seeds = [];
    const pts = [
      [-2.6,  0.0],
      [-2.0,  1.2],
      [-1.2, -1.6],
      [-0.6,  2.2],
      [ 0.6, -2.2],
      [ 1.2,  1.6],
      [ 2.0, -1.2],
      [ 2.6,  0.0]
    ];
    for(const p of pts){
      seeds.push({ x1: p[0], x2: p[1], trail: [] });
    }
  }
  reseed();

  resetBtn.addEventListener("click", reseed);

  let raf = null;
  let running = true;

  function drawAxes(){
    ctx.clearRect(0,0,canvas.width,canvas.height);

    ctx.globalAlpha = 0.35;
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 1;
    ctx.beginPath();
    const [x0a,y0a] = toCanvas(0, world.x2Min);
    const [x0b,y0b] = toCanvas(0, world.x2Max);
    ctx.moveTo(x0a,y0a);
    ctx.lineTo(x0b,y0b);

    const [x1a,y1a] = toCanvas(world.x1Min, 0);
    const [x1b,y1b] = toCanvas(world.x1Max, 0);
    ctx.moveTo(x1a,y1a);
    ctx.lineTo(x1b,y1b);
    ctx.stroke();

    ctx.globalAlpha = 1.0;
  }

  function step(){
    if(!running) return;

    const a = Number(sa.slider.value);
    const b = Number(sb.slider.value);
    const dt = 0.015;

    drawAxes();

    for(const s of seeds){
      for(let k=0; k<6; k++){
        const out = rk4Step(s.x1, s.x2, dt, a, b);
        s.x1 = out[0];
        s.x2 = out[1];

        if(s.x1 > Math.PI) s.x1 -= 2*Math.PI;
        if(s.x1 < -Math.PI) s.x1 += 2*Math.PI;

        s.trail.push([s.x1, s.x2]);
        if(s.trail.length > 180) s.trail.shift();
      }
        ctx.globalAlpha = 0.9;

        const colors = [
          "#ff7aa2",  // pink
        ];

        ctx.strokeStyle = colors[Math.floor(Math.random()*colors.length)];
        ctx.lineWidth = 1.6;

        ctx.beginPath();
      for(let i=0;i<s.trail.length;i++){
        const p = s.trail[i];
        const q = toCanvas(p[0], p[1]);
        if(i===0) ctx.moveTo(q[0], q[1]);
        else ctx.lineTo(q[0], q[1]);
      }
      ctx.stroke();
      ctx.globalAlpha = 1.0;
    }

    raf = requestAnimationFrame(step);
  }

  raf = requestAnimationFrame(step);

  return {
    destroy: async ()=>{
      running = false;
      if(raf) cancelAnimationFrame(raf);
      try{ container.removeChild(wrap); }catch(_){}
    }
  };
}
