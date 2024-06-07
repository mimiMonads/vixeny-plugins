
import { Ajv } from '@feathersjs/schema'
import { plugins, wrap } from 'vixeny'
import { Type , type ObjectOptions, type TProperties} from '@sinclair/typebox';



const dataValidator = new Ajv()


type TypeBoxElement<T extends TProperties> = {
    type?: 'body'
    scheme?: T,
    options?: ObjectOptions
}

type TypeBoxElementArray = {[key: string]: TypeBoxElement<any>}

const test = <T extends TypeBoxElementArray>(f:T)=> (
    sym => plugins.type({
    name: sym,
    type: {} as {includes: (keyof T)[]},
    options: f,
    isAsync: true,
    f: (o)=> (p)=> {

        const name = plugins.getName(o)(sym)

        const options = plugins.getOptions(p)(name) as {includes: (keyof T)[]}


        if (options){
            const compiled = dataValidator.compile(Type.Object(f[options.includes[0]].scheme))
          
            return async (r: Request) =>  (
                obj => {

                    console.log(obj)
                    return compiled( obj ) ? obj : null
                }
            )(
                await r.json()  as { [V in keyof T]: T[V]['scheme'] | null}
            )


        }

        throw new Error('For a compiled validator you must provide a scheme in /`plugins.[nameOfYourValidator]/`')

    
    }})
)(
    Symbol('TypeBox')
)

const a = test({
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
        typebox: a
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
        f: (ctx) => JSON.stringify(ctx.typebox?.key)
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