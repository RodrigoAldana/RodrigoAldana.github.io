export function createSlider(container, label, cfg, onChange){

  const row = document.createElement("div")

  const text = document.createElement("span")
  text.textContent = label + ": " + cfg.value

  const slider = document.createElement("input")
  slider.type = "range"
  slider.min = cfg.min
  slider.max = cfg.max
  slider.step = cfg.step
  slider.value = cfg.value

  slider.oninput = ()=>{
      const v = parseFloat(slider.value)
      text.textContent = label + ": " + v
      onChange(v)
  }

  row.appendChild(text)
  row.appendChild(slider)

  container.appendChild(row)
}
