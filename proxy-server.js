const proxy = require('redbird')({ port: 80, xfwd: false })
// const express = require('express')
// const app = express()
let sessions = {}

sessions['first'] = "172.17.0.2:3000"
sessions['second'] = "172.17.0.3:3000"

// proxy.register('spacecraft-repl.com/first', sessions['first'])
// proxy.register('spacecraft-repl.com/', sessions['first'])

// const docker = require('redbird').docker
// proxy.register('spacecraft-repl.com', sessions['first'])
proxy.register('spacecraft-repl.com/first', sessions['first'])
proxy.register('spacecraft-repl.com/second', sessions['second'])
 

