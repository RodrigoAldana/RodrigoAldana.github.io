import {createPhasePortrait} from "./phase_portrait.js"
import {createSlider} from "./sliders.js"

export function mountPhaseScene(container, config){

  const canvas = document.createElement("canvas")
  canvas.width = 500
  canvas.height = 400

  const controls = document.createElement("div")

  container.appendChild(canvas)
  container.appendChild(controls)

  const params = {}

  Object.keys(config.params).forEach(k=>{
      params[k] = config.params[k].value
  })

  const phase = createPhasePortrait(
      canvas,
      config.system,
      params,
      config.domain,
      config.options || {}
  )

  Object.entries(config.params).forEach(([name,cfg])=>{
      createSlider(controls, name, cfg, v=>{
          params[name]=v
      })
  })

  createSlider(controls,"zoom",
      {min:0.5,max:3,step:0.1,value:1},
      z=>phase.setZoom(z)
  )

  let last = performance.now()

  function loop(t){

      const dt = (t-last)/1000
      last = t

      phase.step(dt)
      phase.draw()

      requestAnimationFrame(loop)
  }

  requestAnimationFrame(loop)

  return {
      destroy(){
          container.innerHTML=""
      }
  }
}
