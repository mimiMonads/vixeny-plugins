
import * as Avj from '@feathersjs/schema'
import { plugins, wrap } from 'vixeny'
import { Type } from '@sinclair/typebox';
import * as TypeBox from '@sinclair/typebox';
import * as Vixney from 'vixeny'
import main from './src/avj/main.ts';


const parser = main(Vixney)(Avj)(TypeBox)
const bodyParser = parser({
    key: {
        scheme: {
            id: Type.Number(),
            text: Type.String(),
            createdAt: Type.Number(),
            userId: Type.Number()
          },
          options: { $id: 'Message', additionalProperties: false }
    }
    
})

const opt = plugins.globalOptions({
    cyclePlugin:{
        typebox: bodyParser
    }
})

const serve = wrap(opt)()
    .stdPetition({
        path: "/hi",
        method: 'POST',
        plugins:{
            typebox: {
                includes: ['key']
            }
        },
        isAsync: true,
        f: (ctx) => JSON.stringify(ctx.typebox)
    }).testRequests()

console.log(
    await serve(
        new Request('http://hihihi.com/hi', {
            method: 'POST',
            body: JSON.stringify({
                id: 1,
                text: "Hello, world!",
                createdAt: Date.now(),
                userId: 123
                })
        })
    ).then( x => x.text())
)


  