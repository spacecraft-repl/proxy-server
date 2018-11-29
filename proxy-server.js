const proxy = require('redbird')({ port: 80, xfwd: false })
// const express = require('express')
// const app = express()
let sessions = {}

sessions['first'] = "proxy-fix";

// proxy.register('spacecraft-repl.com/first', sessions['first'])
// proxy.register('spacecraft-repl.com/', sessions['first'])

const docker = require('redbird').docker
docker(proxy).register('spacecraft-repl.com', sessions['first'])
docker(proxy).register('spacecraft-repl.com/first', sessions['first'])
 

