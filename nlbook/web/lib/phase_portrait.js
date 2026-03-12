import {rk4Step} from "./rk4.js"

export function createPhasePortrait(canvas, system, params, domain, options={}){

  const ctx = canvas.getContext("2d")

  const W = canvas.width
  const H = canvas.height

  const config = {
      ambientCount: options.ambientCount ?? 40,
      ambientLifetime: options.ambientLifetime ?? 1.2,
      pathLength: options.pathLength ?? 80,
      gridStep: options.gridStep ?? 1,
      circles: options.circles ?? []
  }

  let zoom = 1

  let userTraj = []
  let randomTraj = []

  function viewDomain(){

      return {
          xmin: domain.xmin/zoom,
          xmax: domain.xmax/zoom,
          ymin: domain.ymin/zoom,
          ymax: domain.ymax/zoom
      }
  }

  function worldToScreen(x,y){

      const d = viewDomain()

      const u = (x-d.xmin)/(d.xmax-d.xmin)*W
      const v = H - (y-d.ymin)/(d.ymax-d.ymin)*H

      return [u,v]
  }

  function screenToWorld(u,v){

      const d = viewDomain()

      const x = d.xmin + u/W*(d.xmax-d.xmin)
      const y = d.ymin + (H-v)/H*(d.ymax-d.ymin)

      return [x,y]
  }

  canvas.onclick = (e)=>{

      const rect = canvas.getBoundingClientRect()

      const u = e.clientX - rect.left
      const v = e.clientY - rect.top

      const [x,y] = screenToWorld(u,v)

      userTraj.push({x:[x,y], path:[]})
  }

  function spawnRandom(initial=false){

      const d = viewDomain()

      const x = d.xmin + Math.random()*(d.xmax-d.xmin)
      const y = d.ymin + Math.random()*(d.ymax-d.ymin)

      randomTraj.push({
          x:[x,y],
          path:[],
          life: initial
              ? Math.random()*config.ambientLifetime
              : 0
      })
  }

  for(let i=0;i<config.ambientCount;i++){
      spawnRandom(true)
  }

  function step(dt){

      userTraj.forEach(t=>{
          t.x = rk4Step(t.x, dt, system, params)
          t.path.push([...t.x])

          if(t.path.length > config.pathLength){
              t.path.shift()
          }
      })

      let survivors = []

      randomTraj.forEach(t=>{

          t.x = rk4Step(t.x, dt, system, params)
          t.path.push([...t.x])
          t.life += dt

          if(t.path.length > config.pathLength){
              t.path.shift()
          }

          if(t.life < config.ambientLifetime){

              survivors.push(t)

          } else {

              const d = viewDomain()

              const x = d.xmin + Math.random()*(d.xmax-d.xmin)
              const y = d.ymin + Math.random()*(d.ymax-d.ymin)

              survivors.push({
                  x:[x,y],
                  path:[],
                  life:0
              })

          }

      })

      randomTraj = survivors
  }

  function drawGrid(){

      ctx.strokeStyle = "rgba(255,255,255,0.08)"
      ctx.lineWidth = 1

      const d = viewDomain()

      for(let x=Math.ceil(d.xmin); x<=d.xmax; x+=config.gridStep){

          const p = worldToScreen(x,0)
          const u = p[0]

          ctx.beginPath()
          ctx.moveTo(u,0)
          ctx.lineTo(u,H)
          ctx.stroke()
      }

      for(let y=Math.ceil(d.ymin); y<=d.ymax; y+=config.gridStep){

          const p = worldToScreen(0,y)
          const v = p[1]

          ctx.beginPath()
          ctx.moveTo(0,v)
          ctx.lineTo(W,v)
          ctx.stroke()
      }
  }

  function drawAxes(){

      ctx.strokeStyle = "rgba(255,255,255,0.35)"
      ctx.lineWidth = 2

      const p = worldToScreen(0,0)
      const u0 = p[0]
      const v0 = p[1]

      ctx.beginPath()
      ctx.moveTo(u0,0)
      ctx.lineTo(u0,H)
      ctx.stroke()

      ctx.beginPath()
      ctx.moveTo(0,v0)
      ctx.lineTo(W,v0)
      ctx.stroke()
  }

  function drawAxisNumbers(){

      ctx.fillStyle = "rgba(255,255,255,0.55)"
      ctx.font = "12px system-ui"

      const d = viewDomain()

      for(let x=Math.ceil(d.xmin); x<=d.xmax; x+=config.gridStep){

          const [u,v] = worldToScreen(x,0)

          ctx.fillText(x.toFixed(1), u+3, v+14)
      }

      for(let y=Math.ceil(d.ymin); y<=d.ymax; y+=config.gridStep){

          const [u,v] = worldToScreen(0,y)

          ctx.fillText(y.toFixed(1), u+6, v-4)
      }
  }

  function drawAxisLabels(){

      ctx.fillStyle = "rgba(255,255,255,0.75)"
      ctx.font = "14px system-ui"

      const [u0,v0] = worldToScreen(0,0)

      ctx.fillText("x₁", W-20, v0-6)
      ctx.fillText("x₂", u0+6, 16)
  }

  function drawCircles(){

      if(!config.circles.length) return

      ctx.strokeStyle = "rgba(255,211,122,0.6)"
      ctx.lineWidth = 1.6

      config.circles.forEach(c=>{

          const center = worldToScreen(c.x, c.y)
          const edge   = worldToScreen(c.x + c.r, c.y)

          const R = Math.abs(edge[0] - center[0])

          ctx.beginPath()
          ctx.arc(center[0], center[1], R, 0, Math.PI*2)
          ctx.stroke()

      })
  }

  function drawRandomTraj(){

      randomTraj.forEach(t=>{

          const lifeFade = 1 - (t.life / config.ambientLifetime)

          for(let i=1;i<t.path.length;i++){

              const p0 = t.path[i-1]
              const p1 = t.path[i]

              const pathFade = i / t.path.length

              const alpha = 0.35 * pathFade * lifeFade

              ctx.strokeStyle = "rgba(200,200,200," + alpha + ")"
              ctx.lineWidth = 1.2

              const s0 = worldToScreen(p0[0],p0[1])
              const s1 = worldToScreen(p1[0],p1[1])

              ctx.beginPath()
              ctx.moveTo(s0[0],s0[1])
              ctx.lineTo(s1[0],s1[1])
              ctx.stroke()
          }

      })
  }

  function drawUserTraj(){

      userTraj.forEach(t=>{

          for(let i=1;i<t.path.length;i++){

              const p0 = t.path[i-1]
              const p1 = t.path[i]

              const alpha = i/t.path.length

              ctx.strokeStyle = "rgba(255,122,162," + (0.9*alpha) + ")"
              ctx.lineWidth = 2.2

              const s0 = worldToScreen(p0[0],p0[1])
              const s1 = worldToScreen(p1[0],p1[1])

              ctx.beginPath()
              ctx.moveTo(s0[0],s0[1])
              ctx.lineTo(s1[0],s1[1])
              ctx.stroke()

          }

      })
  }

  function draw(){

      ctx.clearRect(0,0,W,H)

      drawGrid()
      drawAxes()

      drawAxisNumbers()
      drawAxisLabels()

      drawCircles()

      drawRandomTraj()
      drawUserTraj()
  }

  return {

      step,
      draw,

      setZoom(z){
          zoom = z
      }

  }

}
