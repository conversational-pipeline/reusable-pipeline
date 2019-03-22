// Import Wolf dependency
import { Slot } from 'wolf-core'

// Import Wolf's Bot Builder storage layer
import { StorageLayerType } from 'wolf-botbuilder'

// Import OrderState from abilities
import { OrderState } from './abilities'

// Import number conversion library
import { wordsToNum } from './helpers/convert'

// tokens (aka slot names): ADD SUBSTITUTE SIZE FLAVOR QUANTITY TARGET ITEM END_OF_ORDER NEED_MORE_TIME None
// entities to focus on, tokens (aka slot names): ADD SUBSTITUTE SIZE FLAVOR TARGET ITEM END_OF_ORDER

export const slots = [
  {
    name: 'ITEM',
    query: () => { return 'What item would you like?' }
  },
  {
    name: 'QUANTITY',
    query: () => { return 'How many items?' },
    retry: () => { return 'Please enter how many items.' },
    validate: (submittedValue) => {
      const num = wordsToNum(submittedValue);
      if (isNaN(num)) {
        return { isValid: false, reason: 'unable to parse' }
      }
      return { isValid: true, reason: null }
    }
  },
  {
    name: 'TARGET',
    query: () => { return 'What item would you like to replace?' }
  },
  {
    name: 'AFFIRMATIVE',
    query: () => { return 'Are you done with your order?' }
  },
  {
    name: 'END_OF_ORDER_TOKEN',
    query: () => { return 'Are you done with your order?' }
  },
] as Slot<StorageLayerType<OrderState>>[]