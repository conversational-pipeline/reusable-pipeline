// Load in environment variables
import * as dotenv from 'dotenv'
dotenv.config()

// Import Wolf dependency
import * as wolf from 'wolf-core'

// Import Wolf's Bot Builder storage layer
import { createBotbuilderStorageLayer, createWolfStorageLayer, StorageLayerType } from 'wolf-botbuilder'

// Import Wolf abilities and slots
import { OrderState, abilities, getDefaultOrderState } from './abilities'
import { slots } from './slots'
import { callLuis } from './helpers/luis'

// Bring in Bot Builder dependency
import * as restify from 'restify'
import { BotFrameworkAdapter, MemoryStorage, ConversationState } from 'botbuilder'

// Create HTTP server with restify
const server = restify.createServer()
server.listen(process.env.port || process.env.PORT || 3978, '0.0.0.0', () => {
  console.log(`\n${server.name} listening to ${server.url}`)
})

// Create adapter (Bot Builder specific)
const adapter = new BotFrameworkAdapter({
  appId: process.env.microsoftAppID,
  appPassword: process.env.microsoftAppPassword,
})

// Setup storage layer
const memoryStorage = new MemoryStorage()
const conversationState = new ConversationState(memoryStorage)
const conversationStorageLayer = createBotbuilderStorageLayer<OrderState>(conversationState)
const wolfStorageLayer = createWolfStorageLayer(conversationState)

const flow: wolf.Flow<OrderState, StorageLayerType<OrderState>> = {
  abilities,
  slots
}

// Listen for incoming requests
server.post('/api/messages', (req, res) => {
  console.log('before processActivity')
  adapter.processActivity(req, res, async (context) => {
    // Has to be a message, ignores all other activity (such as conversation update events)
    if (context.activity.type !== 'message') {
      return
    }

    // Bot logic here
    const wolfResult = await wolf.run(
      wolfStorageLayer(context),
      conversationStorageLayer(context, getDefaultOrderState()),
      () => callLuis(context),
      // () => ([{ intent: 'greeting', entities: [], message: '' }]),
      () => flow,
      'greet'
    ).catch((err) => {
      console.log(err)
    })

    if (wolfResult) {
      console.log('before wolfResult')
      // Respond Wolf messages
      const sendActivities = wolfResult.messageStringArray.map((message) => context.sendActivity(message))
      return Promise.all(sendActivities)
    } else {
      return context.sendActivity('wolf error')
    }
  })
})
