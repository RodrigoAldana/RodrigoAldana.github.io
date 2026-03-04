const panelEl = document.getElementById("panel");
const panelTagEl = document.getElementById("panelTag");

let current = {
  id: null,
  destroy: null
};

function getPanelErrEl(){
  return document.getElementById("panelErr");
}

function showPanelError(msg){
  const e = getPanelErrEl();
  if(!e) return;
  e.style.display = "block";
  e.textContent = msg;
}

function clearPanelError(){
  const e = getPanelErrEl();
  if(!e) return;
  e.style.display = "none";
  e.textContent = "";
}

async function typeset(root){
  if(window.MathJax && window.MathJax.typesetPromise){
    await window.MathJax.typesetPromise([root]);
  }
}

export function setPanelTag(s){
  panelTagEl.textContent = s;
}

export function clearPanelUI(){
  panelEl.innerHTML = `Click a highlighted anchor in the source.<div id="panelErr"></div>`;
}

async function destroyCurrent(){
  try{
    if(current.destroy) await current.destroy();
  }catch(_){}
  current = { id: null, destroy: null };
}

async function maybeMountAnimations(root){
  const mounts = Array.from(root.querySelectorAll(".animMount"));
  for(const m of mounts){
    const id = m.getAttribute("data-anim");
    if(!id) continue;
    const mod = await import(`../animations/${id}/anim.js`);
    if(mod && typeof mod.mount === "function"){
      const handle = await mod.mount(m);
      if(handle && typeof handle.destroy === "function"){
        const prevDestroy = current.destroy;
        current.destroy = async ()=>{
          if(prevDestroy) await prevDestroy();
          await handle.destroy();
        };
      }
    }
  }
}

export async function openPanel(id){
  clearPanelError();
  setPanelTag(id);

  await destroyCurrent();

  try{
    const r = await fetch(`../build/panels/${id}.html`, { cache: "no-store" });
    if(!r.ok) throw new Error(`missing build/panels/${id}.html`);
    const html = await r.text();

    panelEl.innerHTML = html + `<div id="panelErr"></div>`;
    await typeset(panelEl);
    await maybeMountAnimations(panelEl);

    current.id = id;
  }catch(e){
    panelEl.innerHTML = `Panel load failed.<div id="panelErr"></div>`;
    showPanelError(String(e));
  }
}
