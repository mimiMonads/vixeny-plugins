import type * as vix from "vixeny";

import type * as TypeBox from "@sinclair/typebox";
import { TypeCompiler } from '@sinclair/typebox/compiler'

type TypeBoxElement<T extends TypeBox.TProperties> = {
  readonly type?: "body";
  readonly scheme?: T;
  readonly options?: TypeBox.ObjectOptions;
};

// Generic type to control the keys of TypeBoxElementArray
type TypeBoxElementArray<K extends string> = {
  [key in K]: TypeBoxElement<any>;
};



export default (args: {
  plugins: typeof vix["plugins"];
  TypeCompiler: typeof TypeCompiler;
  TypeBox: typeof TypeBox;
}) =>
<T extends TypeBoxElementArray<any>>(f: T) =>
  (
    (sym) =>
      args.plugins.type({
        name: sym,
        type: {} as { includes: (keyof T)[] },
        options: f,
        isFunction: false,
        isAsync: true,
        f: (ctx) => {
          // Getting all the respective values from options and petition
          ctx.currentName(sym);

          const name = ctx.currentName(sym);

          const optionsFrom = ctx.getOptionsFromPetition<{
            includes: (keyof T)[];
          }>(ctx.getPetition())(name);

          const isUsing = ctx.pluginIsUsing(name);

          // Getting the currrent options with
          const elements = optionsFrom?.includes ?? isUsing ?? null;

          if (elements === null) {
            throw new Error(
              `Typebox can find any schema to compile, have you tried plugins:{${name}: include: [${
                Object.keys(f).toString()
              }]}`,
            );
          }

          if (Array.isArray(elements) && elements.length === 1) {
            // Yeah it sucks but it loos nice
            
           
            const position = f[elements[0]];


            const compiled = TypeCompiler.Compile(
              args.TypeBox.Object(position.scheme)
            );

            return async (r: Request) =>
              (
                (obj) => {
                  return (compiled.Check(obj) ? { [elements[0]]: obj } : null) as
                    | { [V in keyof T]: T[V]["scheme"] }
                    | null;
                }
              )(
                await r.json(),
              );
          }

          throw new Error(
            "For a compiled validator you must provide a scheme in /`plugins.[nameOfYourValidator]/`",
          );
        },
      })
  )(
    Symbol("TypeBox"),
  );
