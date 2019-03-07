const express = require('express')
const fs = require('fs')
const fuzzysort = require('fuzzysort')
const {trim} = require('lodash')

const content = fs.readFileSync('./data/processed/items.json')
const items = JSON.parse(content)
const transformed = items.map(item => {
  const {id, displayName, ...rest} = item
  return {
    id,
    displayName,
    compressedCommon: trim(rest.commonNames.reduce((prev, curr) => {
      return prev + ' ' + curr
    }, '')),
    ...rest
  }
})

const app = express()
const port = 3000

app.get('/search', (req, res) => {
  const { name } = req.query
  console.log('in here')
  const results = fuzzysort.go(name, transformed, {
    keys: ['displayName', 'compressedCommon']
  })

  const responseData = results.map((result) => {
    return {
      confidence: result.score,
      itemDescription: result.obj
    }
  })
  res.json(responseData)
})

app.get('/id', (req, res) => {
  const { id } = req.query
  const result = transformed.find(item => item.id === id)
  const responseData = result ? {
    confidence: 1,
    itemDescription: result
  } : {
    confidence: 0,
    itemDescription: null
  }

  res.json(responseData)
})

app.listen(port, '0.0.0.0', () => console.log(`menu service is listening on port ${port}!`))
