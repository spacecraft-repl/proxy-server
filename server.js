// 'use strict'

const proxy = require('redbird')({
  port: 80,
})

const DOMAIN = 'repl.space'
const PORT   = 3000

let sessions = [
  {
    src:    `first.${DOMAIN}`,
    target: `172.17.0.3:${PORT}`,
  },
  {
    src:    `second.${DOMAIN}`,
    target: `172.17.0.5:${PORT}`,
  },
]

const registerSessionRoute = ({src, target}) => {
  proxy.register(src, target)
}

sessions.forEach(registerSessionRoute)