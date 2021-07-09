const { Workbook } = require('excel4node')

export const array2excel = (values: unknown[][]): Promise<Buffer> => {
  const wb = new Workbook()
  const ws = wb.addWorksheet('статистика')
  
  for (let row = 0; row < values.length; row++) {
    const line = values[row]

    for (let col = 0; col < line.length; col++) {
      const value = line[col]
      const cell = ws.cell(row + 1, col + 1)

      if (!isNaN(Number(value)) && value !== '') {
        cell.number(Number(value))
      } else {
        cell.string(String(value))
      }
    }
  }
  
  return wb.writeToBuffer()
}
