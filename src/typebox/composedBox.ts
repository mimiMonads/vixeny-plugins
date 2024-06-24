import type * as vix from "vixeny";
import type * as Avj from "@feathersjs/schema";
import type * as TypeBox from "@sinclair/typebox";

type TypeBoxElement<T extends TypeBox.TProperties> = {
  readonly type?: "body";
  readonly scheme?: T;
  readonly options?: TypeBox.ObjectOptions;
};

// Generic type to control the keys of TypeBoxElementArray
type TypeBoxElementArray<K extends string> = {
  [key in K]: TypeBoxElement<any>;
};

export default ({ plugins }: typeof vix) =>
({ Ajv }: typeof Avj) =>
({ Type }: typeof TypeBox) =>
<T extends TypeBoxElementArray<any>>(f: T) =>
  (
    (sym) =>
      plugins.type({
        name: sym,
        type: {} as { includes: (keyof T)[] },
        options: f,
        isAsync: true,
        f: (o) => (p) => {
          // Getting all the respective values from options and petition
          const name = plugins.getName(o ?? {})(sym);
          const optionsFrom = plugins.getOptions(p)(name) as {
            includes: (keyof T)[];
          };
          const isUsing = plugins.pluginIsUsing(p)(name);

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
            const elements = optionsFrom?.includes[0] ?? isUsing![0];
            const dataValidator = new Ajv();
            const position = f[elements];

            //compiled
            const compiled = dataValidator.compile(
              Type.Object(position.scheme),
            );

            return async (r: Request) =>
              (
                (obj) => {
                  return (compiled(obj) ? { [elements]: obj } : null) as
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
