const proxy = require('redbird')({
  port: 80,
  useTargetHostHeader: true,
})

const DOMAIN = 'repl.space'

let sessions = [
  {
    src:    `first.${DOMAIN}`,
    target: '172.17.0.3:3000',
  },
  {
    src:    `second.${DOMAIN}`,
    target: '172.17.0.5:3000',
  },
]

const registerSessionRoute = ({src, target}) => {
  proxy.register(src, target, { useTargetHostHeader: true })
}

sessions.forEach(registerSessionRoute)
