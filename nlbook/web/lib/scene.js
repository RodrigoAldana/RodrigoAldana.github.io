export function createSlider(container, label, cfg, onChange){

  const row = document.createElement("div")
  row.style.display = "flex"
  row.style.flexDirection = "column"
  row.style.gap = "6px"
  row.style.margin = "10px 0"
  row.style.width = "100%"
  row.style.maxWidth = "100%"
  row.style.boxSizing = "border-box"

  const text = document.createElement("div")
  text.textContent = label + ": " + cfg.value
  text.style.fontSize = "14px"

  const slider = document.createElement("input")
  slider.type = "range"
  slider.min = cfg.min
  slider.max = cfg.max
  slider.step = cfg.step
  slider.value = cfg.value
  slider.style.width = "100%"
  slider.style.maxWidth = "100%"
  slider.style.boxSizing = "border-box"
  slider.style.margin = "0"

  slider.oninput = ()=>{
      const v = parseFloat(slider.value)
      text.textContent = label + ": " + v
      onChange(v)
  }

  row.appendChild(text)
  row.appendChild(slider)
  container.appendChild(row)
}
