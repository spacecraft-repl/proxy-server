const Docker = require('dockerode')
const docker = new Docker()

console.log(docker)

// docker.run('ubuntu', ['bash', '-c', 'uname -a'], process.stdout, function (err, data, container) {
//  console.log(data.StatusCode);
//});

docker.createContainer({
  Image: 'proxy-fix',
  Tty: false,
  ExposedPorts: { "3000/tcp": {} },
  HostConfig: {
    Runtime: 'runsc',
    Memory: 100000000,
    CpuPeriod: 100000,
    CpuQuota:   20000,
  }
}, function (err, container) {
  container.start(function (err, data) {
    container.inspect(container.id).then(data => {
      console.log(data.NetworkSettings.IPAddress)
    })
  })
})

