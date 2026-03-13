import { openPanel, setPanelTag, clearPanelUI } from "./panel_runtime.js";


const appLayout = document.querySelector(".app")
const resizer = document.getElementById("resizer")

let dragging = false

resizer.addEventListener("mousedown",(e)=>{
  dragging = true
  document.body.style.userSelect = "none"
  e.preventDefault()
})

window.addEventListener("mouseup", ()=>{
  dragging = false
  document.body.style.userSelect = ""
})

window.addEventListener("mousemove",(e)=>{

  if(!dragging) return

  const rect = appLayout.getBoundingClientRect()

  const x = e.clientX - rect.left
  const width = rect.width

  let left = x/width*100

  if(left < 15) left = 15
  if(left > 85) left = 85

  const right = 100-left

  appLayout.style.gridTemplateColumns =
    left + "% 6px " + right + "%"
})

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
