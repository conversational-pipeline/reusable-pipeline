// Import Wolf dependency
import { Ability } from 'wolf-core'

// Import Wolf's Bot Builder storage layer
import { StorageLayerType } from 'wolf-botbuilder'

interface Product {
  name: string,
  quantity: string
}

export interface OrderState {
  products: Product[]
}

export const getDefaultOrderState = (): OrderState => {
  return {
    products: []
  }
}

// intents: ADD REMOVE SUBSTITUTE None
// tokens: ADD REMOVE SUBSTITUTE SIZE FLAVOR QUANTITY END_OF_ORDER NEED_MORE_TIME None
// entities Michael recommends looking for: ADD SUBSTITUTE SIZE FLAVOR QUANTITY TARGET ITEM
// note: "None" can have entity of END_OF_ORDER

export const abilities = [
  {
    name: 'greet',
    traces: [],
    onComplete: () => {
      return 'Hello! Welcome to order bot.'
    }
  },
  {
    name: 'ADD',
    traces: [
      {
        slotName: 'ITEM'
      },
      {
        slotName: 'QUANTITY'
      }
    ],
    onComplete: async (submittedData, { read, save }) => {
      const { ITEM: addProduct, QUANTITY: addQuantity } = submittedData
      const convoState = await read()
      const prevProducts = convoState.products || []

      // Add product
      const newState = {
        products: [
          ...prevProducts,
          { name: addProduct, quantity: addQuantity }
        ]
      }

      await save(newState)

      return `${addQuantity} ${addProduct} is added to your order!`
    }
  },
  {
    name: 'REMOVE',
    traces: [
      {
        slotName: 'ITEM'
      }
    ],
    onComplete: async (submittedData, { read, save }) => {
      const { ITEM: removeProduct } = submittedData
      const convoState = await read()
      const stateProducts = convoState.products || []

      // Check if product name exists
      if (!stateProducts.some((product: Product) => product.name === removeProduct)) {
        return `There is no item with name ${removeProduct} in your order.`
      }

      // Remove product
      const remainingProducts = stateProducts.filter((product: Product) => product.name !== removeProduct)
      const newState = {
        products: remainingProducts
      }

      await save(newState)

      return `The ${removeProduct} has been removed from your order.`
    }
  },
  {
    name: 'SUBSTITUTE',
    traces: [
      {
        slotName: 'ITEM'
      },
      {
        slotName: 'QUANTITY'
      },
      {
        slotName: 'TARGET'
      }
    ],
    onComplete: async (submittedData, { read, save }) => {
      const { TARGET: removeProduct, ITEM: addProduct, QUANTITY: addQuantity } = submittedData
      const convoState = await read()
      const stateProducts = convoState.products || []

      // Check if product name exists
      if (!stateProducts.some((product: Product) => product.name === removeProduct)) {
        return `There is no item with name ${removeProduct} in your order.`
      }

      // Remove product
      const remainingProducts = stateProducts.filter((product: Product) => product.name !== removeProduct)

      // Add Product
      const newState = {
        products: [
          ...remainingProducts,
          { name: addProduct, quantity: addQuantity }
        ]
      }
      await save(newState)

      return `The ${removeProduct} has been replaced with ${addQuantity} ${addProduct} in your order.`
    }
  },
  {
    name: 'None',
    traces: [
      {
        slotName: 'END_OF_ORDER'
      }
    ],
    onComplete: async (submittedData, { read }) => {
      const convoState = await read()
      const products = convoState.products || []

      if (products.length === 0) {
        return `You do not have any products in your order!`
      }
      return products.map((product: Product) => `${product.quantity} ${product.name}`).join(', ')
    }
  },
] as Ability<OrderState, StorageLayerType<OrderState>>[]
