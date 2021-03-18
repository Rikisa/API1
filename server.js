const Hapi = require('@hapi/hapi');
const {configureRoutes} = require('./routes');

//start hapi server

const server = new Hapi.server({
    host: "localhost",
    port: 3000
});

const main = async () => {
    await configureRoutes(server)
    await server.start()
    await server.register(require('@hapi/inert'));

  // Download file
  server.route({
    method: 'GET',
    path: '/download',
    handler: (req, res) => {
        return res.file('./upload/s.jpg', {
            mode: 'attachment'
        });
      }
    })
  
    return server
  }
  
  main().then(server => {
    console.log('Server running at:', server.info.uri)
  }).catch(err => {
    console.log(err)
    process.exit(1)
  })

 