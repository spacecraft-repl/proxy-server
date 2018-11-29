const proxy = require('redbird')({ port:3000 })
const express = require('express')
const app = express()
let sessions = {}

sessions['first'] = "http://spacecraft-repl.com:4000";

proxy.register('localhost/first', sessions['first'])
proxy.register('localhost', sessions['first'])
 