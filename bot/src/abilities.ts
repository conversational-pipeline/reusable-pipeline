// Import Wolf dependency
import { Ability } from 'wolf-core'

// Import Wolf's Bot Builder storage layer
import { StorageLayerType } from 'wolf-botbuilder'

// Import number conversion library
import { wordsToNum } from './helpers/convert'

interface Product {
  name: string,
  quantity: number
}

export interface OrderState {
  products: Product[]
}

export const getDefaultOrderState = (): OrderState => {
  return {
    products: []
  }
}

const updateProducts =
  (prevProducts: Product[], productName: string, productQuantity: number): Product[] => {
    // find existing product, if present
    const existingProduct = prevProducts.find(x => x.name === productName)

    // remove existing from array
    const remainingProducts = prevProducts.filter((x: Product) => x.name !== productName)

    let retProducts

    // check if any Product with productName will still be in cart
    if (productQuantity > 0 || (existingProduct && productQuantity + existingProduct.quantity > 0)) {
      retProducts = [
        ...remainingProducts,
        { name: productName, quantity: (existingProduct ? existingProduct.quantity + productQuantity : productQuantity) }
      ]
    }
    // else all of productName were removed 
    else {
      retProducts = remainingProducts
    }

    return retProducts
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
      const numQuantity = wordsToNum(addQuantity)

      // add/update products
      const newState = {
        products: updateProducts(prevProducts, addProduct, numQuantity)
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
      },
      {
        slotName: 'QUANTITY'
      }
    ],
    onComplete: async (submittedData, { read, save }) => {
      const { ITEM: removeProduct, QUANTITY: removeQuantity } = submittedData
      const convoState = await read()
      const stateProducts = convoState.products || []
      const numQuantity = wordsToNum(removeQuantity)

      // Check if product name exists
      if (!stateProducts.some((product: Product) => product.name === removeProduct)) {
        return `There is no item with name ${removeProduct} in your order.`
      }

      // Remove products
      const newState = {
        products: updateProducts(stateProducts, removeProduct, -numQuantity)
      }

      await save(newState)

      return `${removeQuantity} ${removeProduct} has been removed from your order.`
    }
  },
  {
    name: 'SUBSTITUTE',
    traces: [
      {
        slotName: 'TARGET'
      },
      {
        slotName: 'ITEM'
      },
      {
        slotName: 'QUANTITY'
      },
    ],
    onComplete: async (submittedData, { read, save }) => {
      const { TARGET: removeProduct, ITEM: addProduct, QUANTITY: addQuantity } = submittedData
      const convoState = await read()
      const stateProducts = convoState.products || []
      const numQuantity = wordsToNum(addQuantity)

      // Check if product name exists
      if (!stateProducts.some((product: Product) => product.name === removeProduct)) {
        return `There is no item with name ${removeProduct} in your order.`
      }

      // remove products
      const remainingProducts = updateProducts(stateProducts, removeProduct, -1 /* NLU lacks TARGET_QUANTITY */)

      // add/update products
      const retProducts = updateProducts(remainingProducts, addProduct, numQuantity)

      // save Products
      const newState = {
        products: retProducts
      }
      await save(newState)

      return `The ${removeProduct} has been replaced with ${addQuantity} ${addProduct} in your order.`
    }
  },
  {
    name: 'END_OF_ORDER',
    traces: [
      {
        slotName: 'END_OF_ORDER_TOKEN'
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
  },  {
    name: 'None',
    traces: [
      {
        slotName: 'AFFIRMATIVE'
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
