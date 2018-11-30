const proxy = require('redbird')({ port: 80, xfwd: false })
const docker = require('redbird').docker
const express = require('express')
const app = express()
// let sessions = {}

// sessions['first'] = "proxy-fix";

// proxy.register('spacecraft-repl.com/', "http://159.89.222.252:3000")
// proxy.register('spacecraft-repl.com/first', "http://159.89.222.252:3000")
// proxy.register('spacecraft-repl.com/second', "http://159.89.222.252:3001")

proxy.register('localhost', "http://159.89.222.252:3000")
// proxy.register('localhost:3000', "http://159.89.222.252:3001")

// docker(proxy).register('spacecraft-repl.com', "http://159.89.222.252:3000")
// docker(proxy).register('spacecraft-repl.com/first', "http://159.89.222.252:3000")
// docker(proxy).register('spacecraft-repl.com/second', "http://159.89.222.252:3001")
 

