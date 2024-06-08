import * as vix from 'vixeny'
import * as Avj from '@feathersjs/schema'
import * as TypeBox from '@sinclair/typebox';

type TypeBoxElement<T extends TypeBox.TProperties> = {
    type?: 'body'
    scheme?: T,
    options?: TypeBox.ObjectOptions
}

type TypeBoxElementArray = {[key: string]: TypeBoxElement<any>}

export default 
    ({plugins}: typeof vix) =>
    ({ Ajv }: typeof Avj) =>
    ({  Type }: typeof TypeBox) => <T extends TypeBoxElementArray>(f:T)=> (
        sym => plugins.type({
        name: sym,
        type: {} as {includes: (keyof T)[]},
        options: f,
        isAsync: true,
        f: (o)=> (p)=> {
    
            const name = plugins.getName(o)(sym)
            const optionsFrom = plugins.getOptions(p)(name) as {includes: (keyof T)[]}
    
            
            if (optionsFrom){
                const dataValidator = new Ajv()
                const position = f[optionsFrom.includes[0]]
                const compiled = dataValidator.compile(Type.Object(position.scheme))
              
                return async (r: Request) =>  (
                    obj => {
                        return compiled( obj ) ? { [optionsFrom.includes[0]] : obj} : null
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