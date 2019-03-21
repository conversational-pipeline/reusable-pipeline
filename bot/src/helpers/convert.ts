// Import number conversion library
import * as WtoN from 'words-to-num'

export const wordsToNum =
  (word: string): number => {
    switch (word) {
      case 'the':
      case 'an':
      case 'a':
        return 1
      default:
        return WtoN.convert(word)
    }
  }
