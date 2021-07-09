import * as fs from 'fs'
import * as path from 'path'
import { InfoApiInterface } from '../types/api'

export class InfoApi implements InfoApiInterface {
  private _text: Record<string, string>

  constructor() {
    this._text = {}

    fs.readdirSync('./src/info').forEach(filename => {
      const name = filename.replace(/.txt$/, '')
      this._text[name] = fs.readFileSync(path.join('./src/info', filename)).toString()
    })
  }

  text(name: string) {
    if (name in this._text) {
      return this._text[name]
    }

    throw new Error(`info "${name}" not found`)
  }
}
