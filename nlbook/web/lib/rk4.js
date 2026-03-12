export function rk4Step(x, dt, rhs, params){

  const k1 = rhs(x, params)

  const x2 = x.map((v,i)=>v + 0.5*dt*k1[i])
  const k2 = rhs(x2, params)

  const x3 = x.map((v,i)=>v + 0.5*dt*k2[i])
  const k3 = rhs(x3, params)

  const x4 = x.map((v,i)=>v + dt*k3[i])
  const k4 = rhs(x4, params)

  return x.map((v,i)=>
      v + dt*(k1[i] + 2*k2[i] + 2*k3[i] + k4[i])/6
  )
}
