window.PanelInit = async function () {
  const runBtn = document.getElementById("pendRun");
  const resetBtn = document.getElementById("pendReset");
  const canvas = document.getElementById("pendCanvas");
  const errBox = document.getElementById("pendErr");
  const pyBox = document.getElementById("pendPy");
  const ctx = canvas.getContext("2d");

  function showErr(msg){
    errBox.style.display = "block";
    errBox.textContent = msg;
  }
  function clearErr(){
    errBox.style.display = "none";
    errBox.textContent = "";
  }

  const pyCode =
`import numpy as np

a = 1.0
b = 0.15
dt = 0.01
T = 14.0
N = int(T/dt)

x1 = np.zeros(N)
x2 = np.zeros(N)

x1[0] = 1.8
x2[0] = 0.0

def f(x1, x2):
    return x2, -a*np.sin(x1) - b*x2

for k in range(N-1):
    k1_1, k1_2 = f(x1[k], x2[k])
    k2_1, k2_2 = f(x1[k] + 0.5*dt*k1_1, x2[k] + 0.5*dt*k1_2)
    k3_1, k3_2 = f(x1[k] + 0.5*dt*k2_1, x2[k] + 0.5*dt*k2_2)
    k4_1, k4_2 = f(x1[k] + dt*k3_1, x2[k] + dt*k3_2)
    x1[k+1] = x1[k] + (dt/6.0)*(k1_1 + 2*k2_1 + 2*k3_1 + k4_1)
    x2[k+1] = x2[k] + (dt/6.0)*(k1_2 + 2*k2_2 + 2*k3_2 + k4_2)

out = {"x1": x1.tolist(), "x2": x2.tolist()}
`;
  pyBox.textContent = pyCode;

  function drawAxes(){
    const w = canvas.width, h = canvas.height;
    ctx.clearRect(0,0,w,h);

    ctx.globalAlpha = 0.9;
    ctx.lineWidth = 2;
    ctx.strokeStyle = "rgba(231,237,246,0.28)";

    ctx.beginPath();
    ctx.moveTo(60, h/2);
    ctx.lineTo(w-30, h/2);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo((60 + (w-30))/2, 20);
    ctx.lineTo((60 + (w-30))/2, h-30);
    ctx.stroke();

    ctx.globalAlpha = 1.0;
    ctx.fillStyle = "rgba(169,182,199,0.9)";
    ctx.font = "14px system-ui";
    ctx.fillText("x1", w-55, h/2 - 10);
    ctx.fillText("x2", (60 + (w-30))/2 + 10, 40);
  }

  function worldToCanvas(x1, x2){
    const w = canvas.width, h = canvas.height;
    const left = 60, right = w-30, top = 20, bottom = h-30;
    const x1Min = -3.5, x1Max = 3.5;
    const x2Min = -4.0, x2Max = 4.0;

    const X = left + (x1 - x1Min) * (right-left) / (x1Max - x1Min);
    const Y = bottom - (x2 - x2Min) * (bottom-top) / (x2Max - x2Min);
    return [X,Y];
  }

  async function waitForLoadPyodide(){
    for(let k=0;k<300;k++){
      if(typeof window.loadPyodide === "function") return;
      await new Promise(r=>setTimeout(r, 25));
    }
    throw new Error("Pyodide script did not load");
  }

  async function ensurePyodide(){
    if(window.__pendPyodide) return window.__pendPyodide;

    await waitForLoadPyodide();

    window.__pendPyodide = await window.loadPyodide({
      indexURL: "https://cdn.jsdelivr.net/pyodide/v0.25.1/full/"
    });
    await window.__pendPyodide.loadPackage("numpy");
    return window.__pendPyodide;
  }

  async function computeTrajectory(){
    const pyodide = await ensurePyodide();
    pyodide.runPython(pyCode);
    const out = pyodide.globals.get("out").toJs();
    return { x1: out.x1, x2: out.x2 };
  }

  let anim = { running:false, idx:0, xs:null, ys:null, raf:null };

  function drawTrail(upto){
    const n = Math.min(upto, anim.xs.length);
    ctx.lineWidth = 2;
    ctx.strokeStyle = "rgba(255, 211, 122, 0.75)";
    ctx.beginPath();
    for(let i=0;i<n;i++){
      const [X,Y] = worldToCanvas(anim.xs[i], anim.ys[i]);
      if(i===0) ctx.moveTo(X,Y);
      else ctx.lineTo(X,Y);
    }
    ctx.stroke();
  }

  function drawPoint(i){
    const [X,Y] = worldToCanvas(anim.xs[i], anim.ys[i]);
    ctx.fillStyle = "rgba(255, 244, 194, 0.95)";
    ctx.beginPath();
    ctx.arc(X,Y,6,0,Math.PI*2);
    ctx.fill();
  }

  function frame(){
    if(!anim.running) return;
    drawAxes();
    drawTrail(anim.idx);
    drawPoint(anim.idx);

    anim.idx += 2;
    if(anim.idx >= anim.xs.length){
      anim.running = false;
      runBtn.disabled = false;
      resetBtn.disabled = false;
      return;
    }
    anim.raf = requestAnimationFrame(frame);
  }

  runBtn.onclick = async () => {
    clearErr();
    runBtn.disabled = true;
    resetBtn.disabled = true;
    drawAxes();

    try{
      const traj = await computeTrajectory();
      anim.xs = traj.x1;
      anim.ys = traj.x2;
      anim.idx = 0;
      anim.running = true;
      frame();
    }catch(e){
      anim.running = false;
      runBtn.disabled = false;
      resetBtn.disabled = false;
      showErr(String(e));
      drawAxes();
    }
  };

  resetBtn.onclick = () => {
    if(anim.raf) cancelAnimationFrame(anim.raf);
    anim.running = false;
    anim.idx = 0;
    drawAxes();
    resetBtn.disabled = true;
    runBtn.disabled = false;
  };

  drawAxes();
};
