import * as wolf from 'wolf-core'
import { NlpResult, NlpEntity } from 'wolf-core'
import { TurnContext } from 'botbuilder'
import fetch from 'node-fetch'

const transformLuisEntitiesToNlpEntities = (luisEntity): NlpEntity => {
  return {
    name: luisEntity.type,
    text: luisEntity.entity,
    value: luisEntity.entity
  }
}

const transformLuisToNlpResult = (luisResult): NlpResult[] => {
  return [{
    message: luisResult.query,
    intent: luisResult.topScoringIntent.intent === 'None' ? null : luisResult.topScoringIntent.intent,
    entities: luisResult.entities.map(transformLuisEntitiesToNlpEntities),
  }]
}

const luisEndpoint = process.env.LUIS_ENDPOINT

export const callLuis = (context: TurnContext): Promise<wolf.NlpResult[]> => {
  return fetch(luisEndpoint + context.activity.text)
    .then((res) => res.json())
    .then((luisResult) => transformLuisToNlpResult(luisResult))
}
