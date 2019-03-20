// Import Wolf dependency
import { Slot } from 'wolf-core'

// Import Wolf's Bot Builder storage layer
import { StorageLayerType } from 'wolf-botbuilder'

// Import OrderState from abilities
import { OrderState } from './abilities'

// tokens (aka slot names): ADD SUBSTITUTE SIZE FLAVOR QUANTITY TARGET ITEM END_OF_ORDER NEED_MORE_TIME None
// entities to focus on, tokens (aka slot names): ADD SUBSTITUTE SIZE FLAVOR TARGET ITEM END_OF_ORDER

export const slots = [
  {
    name: 'ITEM',
    query: () => { return 'What item would you like?' }
  },
  {
    name: 'QUANTITY',
    query: () => { return 'How many items would you like?' }
  },
  {
    name: 'TARGET',
    query: () => { return 'What item would you like to target?' }
  },
  {
    name: 'END_OF_ORDER',
    query: () => { return 'Are you done with your order?' }
  },
] as Slot<StorageLayerType<OrderState>>[]