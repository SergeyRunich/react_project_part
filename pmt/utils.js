/* eslint-disable no-unused-vars */
import { invert } from 'lodash'

export const getTableName = i =>
  [
    'Zakladni cena - 5 chodovy',
    '4 chodové menu (WIP)',
    '3 chodové menu',
    '2 chodové menu',
    '1 chodové menu',
  ][i]

export const getKcalRange = (kcal, reverse = false) => {
  const calories = {
    '1400': '0-1400',
    '1600': '1401-1600',
    '1800': '1601-1800',
    '2400': '1801-2400',
    '3000': '2401-3000',
    '3400': '3001-3400',
  }
  return reverse ? invert(calories)[kcal] : calories[kcal]
}

export const getColumnNameByIdentifier = id =>
  ({
    '10': '2 weeks',
    '20': '1M',
    '40': '2M',
    '60': '3M',
  }[id])

export const getRowsForSection = (_, cols) => {
  const rowsPerCol = {}

  Object.keys(cols).forEach(key => {
    rowsPerCol[key] = []
  })

  Object.entries(cols).forEach(([col, prices]) => {
    const colRows = Object.entries(prices)
    colRows.forEach(([kcal, price]) => {
      rowsPerCol[col].push({ [col]: price, kcal: getKcalRange(kcal) })
    })
  })

  const colGroups = Object.entries(rowsPerCol)

  const rows = []

  for (let i = 0; i < rowsPerCol['2'].length; i += 1) {
    colGroups.forEach(([col, r]) => {
      if (rows[i]) rows[i] = { ...rows[i], ...r[i] }
      else rows.push(r[i])
    })
  }

  return rows
}

export const getNewPrices = data => {
  const prices = {}
  const tableNameReversed = ['5', '4', '3', '2', '1']

  data.forEach((rows, i) => {
    const transformed = {}

    rows.forEach(row => {
      Object.entries(row).forEach(([key, price]) => {
        if (key !== 'kcal')
          transformed[key] = {
            ...(transformed[key] ?? {}),
            [getKcalRange(row.kcal, true)]: Number(price),
          }
      })

      const tableId = tableNameReversed[i]
      prices[tableId] = transformed
    })
  })

  return prices
}
