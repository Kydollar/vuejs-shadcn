import { clsx } from 'clsx'
import { countries } from 'countries-list'

import { twMerge } from 'tailwind-merge'

export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

export function valueUpdater(updaterOrValue, ref) {
  ref.value = typeof updaterOrValue === 'function' ? updaterOrValue(ref.value) : updaterOrValue
}

export function getCountryCodeByName(name) {
  const entry = Object.entries(countries).find(
    ([_, data]) => data.name.toLowerCase() === name.toLowerCase(),
  )
  return entry ? entry[0].toLowerCase() : null
}
