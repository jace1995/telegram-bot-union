import { UnionLocationCategory, UnionLocationItem, UnionLocation } from '../types/models'

interface RegExpResult {
  name: string
  level: string
}

export const parse = (lines: string[]): UnionLocation['locations'] => {
  const locations: UnionLocation['locations'] = {}
  const steps: number[] = []
  let level = 0

  for (let i = 0; i < lines.length; i++) {
    const lineNumber = i + 1
    const lineText = lines[i]

    if (!lineText) {
      continue
    }

    const result = lineText.match(/^(?<level>(- *)*)(?<name>.+)/)?.groups as RegExpResult | undefined

    if (!result) {
      throw new ParseLocationsError(lineNumber)
    }

    const lineLevel = (result.level.match(/-/g)?.length ?? 0) + 1
    
    if (lineLevel > level + 1) {
      throw new ParseLocationsError(lineNumber)
    }

    if (lineLevel > level) {
      const locationName = steps.map(s => `${s}.`).join('')
      const location = locations[locationName] as UnionLocationCategory

      if (location) {
        location.items = []
      }

      steps.push(1)
    }
    else {
      if (lineLevel < level) {
        steps.length = lineLevel
      }

      steps[steps.length - 1]++
    }

    level = lineLevel

    const locationName = steps.map(s => `${s}.`).join('')

    locations[locationName] = {
      name: result.name,
    } as UnionLocationItem
  }

  Object.entries(locations).forEach(([categoryId, location]) => {
    const category = location as UnionLocationCategory

    if (!category.items) {
      return
    }

    Object.entries(locations).forEach(([sublocationId, location]) => {
      const sublocation = location as UnionLocationCategory

      if (sublocationId.startsWith(categoryId) && !sublocation.items) {
        category.items.push(sublocationId)
      }
    })
  })

  return locations
}

export class ParseLocationsError extends Error {
  constructor(public line: number) {
    super('parse error on line ' + line)
  }
}

export const parseLocations = (input: string): UnionLocation['locations'] | number => {
  try {
    return parse(input.split('\n'))
  } catch (e) {
    if (e instanceof ParseLocationsError) {
      return e.line
    }
    throw e
  }
}
