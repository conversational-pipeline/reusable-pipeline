// tokens (aka slot names): ADD SUBSTITUTE SIZE FLAVOR QUANTITY TARGET ITEM END_OF_ORDER NEED_MORE_TIME None
// entities to focus on, tokens (aka slot names): ADD SUBSTITUTE SIZE FLAVOR TARGET ITEM END_OF_ORDER

export const slots = [
  {
    name: 'product',
    query: () => { return 'What is the name of your product?' }
  },
] // as Slot<StorageLayerType<OrderState>>[]