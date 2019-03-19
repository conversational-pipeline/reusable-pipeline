import * as wolf from 'wolf-core'
import { NlpResult, NlpEntity } from 'wolf-core'
import { TurnContext } from 'botbuilder'
import fetch from 'node-fetch'

interface LabelItem {
  start: number,
  end: number,
  label: string
}

interface NlpObject {
  groups: { items: LabelItem[] }
  tokens: { items: LabelItem[] },
  utterance: string
}

const nlpAdapter = (result: NlpObject): NlpResult[] => {
  let intents: LabelItem[] = []
  if (result.groups && result.groups.items) {
    intents = result.groups.items
  }

  if (result.tokens && result.tokens.items) {
    const nlpResult: NlpResult[] = intents.map(intent => {
      const filteredItems = result.tokens.items.filter(item => {
        return item.start >= intent.start &&
          item.end <= intent.end
      })

      const entities = filteredItems.map(item => {
        return {
          name: item.label,
          value: result.utterance.slice(item.start, item.end).trim(),
          text: result.utterance.slice(item.start, item.end).trim(),
        }
      })
      return {
        message: result.utterance,
        intent: intent.label,
        entities: entities
      }
    })
    return nlpResult
  }

  return []
}

/**
 * Call to NLU service to process utterance from user
 * @param context Botbuilder object containing user utterance
 */
export const callNlu = (context: TurnContext): Promise<wolf.NlpResult[]> => {
  return fetch(`${process.env.NLU_ENDPOINT || "http://nlu:8080/"}${context.activity.text}`)
    .then((res) => res.json())
    .then((res) => nlpAdapter(res))
}
