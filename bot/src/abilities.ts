interface Product {
  productName: string
}

export interface OrderState {
  products: Product[]
}

export const getDefaultOrderState = (): OrderState => {
  return {
    products: []
  }
}

export const abilities = [
  {
    name: 'greet',
    traces: [],
    onComplete: () => {
      return 'Hello! Welcome to order bot.'
    }
  },
  {
    name: 'addItem',
    traces: [
      {
        slotName: 'product'
      }
    ],
    onComplete: async (submittedData, { read, save }) => {
      const { product: addProduct } = submittedData
      const convoState = await read()
      const prevProducts = convoState.products || []
      const newState = {
        products: [
          ...prevProducts,
          { productName: addProduct }
        ]
      }

      await save(newState)

      return `Your ${addProduct} is added to your order!`
    }
  },
  {
    name: 'removeItem',
    traces: [
      {
        slotName: 'product'
      }
    ],
    onComplete: async (submittedData, { read, save }) => {
      const { product: removeProduct } = submittedData
      const convoState = await read()
      const stateProducts = convoState.products || []

      // Check if product name exists
      if (!stateProducts.some((product: Product) => product.productName === removeProduct)) {
        return `There is no product with name ${removeProduct} in your order.`
      }

      // Remove product
      const remainingProducts = stateProducts.filter((product: Product) => product.productName !== removeProduct)
      const newState = {
        products: remainingProducts
      }

      await save(newState)

      return `The ${removeProduct} has been removed from your order.`
    }
  },
  {
    name: 'listItems',
    traces: [],
    onComplete: async (submittedData, { read }) => {
      const convoState = await read()
      const products = convoState.products || []

      if (products.length === 0) {
        return `You do not have any products in your order!`
      }
      return products.map((products: Product) => products.productName).join(', ')
    }
  },
] // as Ability<UserState, StorageLayerType<OrderState>>[]
