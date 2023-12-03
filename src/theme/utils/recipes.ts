import { addFunctionSerializer } from '@vanilla-extract/css/functionSerializer'
import { recipe } from '@vanilla-extract/recipes'

type RecipeRuntimeFn = ReturnType<typeof recipe>
type VariantsArg<R> = R extends RecipeRuntimeFn ? Parameters<R>[0] : never
type RecipeMeta = {
  importPath: string
  importName: string
  args: [
    {
      defaultClassName: string
      variantClassNames: Record<string, Record<string, string>>
      defaultVariants: Record<string, string>
      compoundVariants: Array<[Record<string, string>, string]>
    }
  ]
}

function mergeRecipes(metaList: RecipeMeta[]) {
  const recipes = metaList.map((r) => r.args[0])

  return {
    importPath: metaList[0].importPath,
    importName: metaList[0].importName,
    args: [
      {
        defaultClassName: recipes
          .map((r) => r.defaultClassName)
          .filter(Boolean)
          .join(' '),
        variantClassNames: recipes.reduce((acc, r) => {
          for (const [variantName, variants] of Object.entries(r.variantClassNames)) {
            acc[variantName] ??= {}

            for (const [variantValue, className] of Object.entries(variants)) {
              if (acc[variantName][variantValue]) {
                acc[variantName][variantValue] += ` ${className}`
              } else {
                acc[variantName][variantValue] = className
              }
            }
          }
          return acc
        }, {} as any),
        defaultVariants: Object.assign({}, ...recipes.map((r) => r.defaultVariants)),
        compoundVariants: recipes.flatMap((r) => r.compoundVariants),
      },
    ],
  }
}

export const recipes = <R extends RecipeRuntimeFn[]>(...recipes: R) => {
  type Variants = VariantsArg<R[number]>
  return addFunctionSerializer(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    (_?: Variants) => '',
    mergeRecipes((recipes as unknown as Array<{ __recipe__: RecipeMeta }>).map((recipe) => recipe.__recipe__))
  )
}
