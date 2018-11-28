'use strict'

const express = require('express')
// const path = require('path')
const bodyParser = require('body-parser')
const http = require('http')
const proxy = require('redbird')({port: 80})
const socketIo = require('socket.io')
const port = process.env.PORT || 3000
const app = express()
const server = http.Server(app)
const io = socketIo(server) // our websocket server

app.use(bodyParser.text())
app.use(express.static('public'))

// Register URL forwarding for homepage of website
// proxy.register("spacecraft-repl.com", "")

server.listen(port, () => {
  console.log('Listening on 3000...')
})
