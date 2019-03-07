const fs = require('fs')
const lodash = require('lodash')

const content = fs.readFileSync('./unprocessed/names.csv', 'utf8')

const names = content.split('\r\n')

const itemDescriptions = names.map((name) => ({
  id: 'product-' + lodash.kebabCase(name),
  displayName: name,
  commonNames: [
    lodash.trim(name
      .replace('Starbucks ', '')
      .replace('Espresso Classics - ', '')
      .replace('Teavana ', '')
      .replace('Tazo ', '')
      .replace('plus', 'with')
      .replace('Caffe ', '')
    )
  ],
  attributes: {
    type: 'product'
  },
  components: [

  ],
  extras: [

  ]
}))

fs.writeFileSync('processed/items.json', JSON.stringify(itemDescriptions, 2, ' '))
