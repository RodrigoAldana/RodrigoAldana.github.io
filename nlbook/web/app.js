import { openPanel, setPanelTag, clearPanelUI } from "./panel_runtime.js";

const sourceEl = document.getElementById("source");

async function typeset(root){
  if(window.MathJax && window.MathJax.typesetPromise){
    await window.MathJax.typesetPromise([root]);
  }
}

async function loadMain(){
  const r = await fetch("../build/main.html", { cache: "no-store" });
  const html = await r.text();
  sourceEl.innerHTML = html;

  sourceEl.querySelectorAll(".selectable").forEach(a=>{
    a.addEventListener("click", async ()=>{
      sourceEl.querySelectorAll(".selectable").forEach(x=>x.classList.remove("active"));
      a.classList.add("active");
      const id = a.getAttribute("data-panel");
      await openPanel(id);
    });
  });

  await typeset(sourceEl);
}

clearPanelUI();
setPanelTag("none");
loadMain();
