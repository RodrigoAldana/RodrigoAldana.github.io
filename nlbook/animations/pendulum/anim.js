import {mountPhaseScene} from "../../web/lib/scene.js"

export async function mount(container){

  return mountPhaseScene(container,{

      system:(x,p)=>[
          x[1],
          -p.a*Math.sin(x[0]) - p.b*x[1]
      ],

      params:{
          a:{value:1,min:0.5,max:5,step:0.1},
          b:{value:0.0,min:0,max:2,step:0.05}
      },

      domain:{
          xmin: -2,
          xmax: 5,
          ymin:-3,
          ymax: 3
      },
      
options:{
    ambientCount:200,
    ambientLifetime:1.0,
    pathLength:70,
    gridStep:1,

    circles:[
        {x:0, y:0, r:0.5},
        {x:Math.PI, y:0, r:0.5}
    ]
}

  })

}
