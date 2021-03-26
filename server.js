const Hapi = require('@hapi/hapi');
const {configureRoutes} = require('./routes');

//start hapi server

module.exports = server = new Hapi.server({
    host: "localhost",
    port: 3000
});

const main = async () => {
    await configureRoutes(server)
    await server.start()
    await server.register(require('@hapi/inert'));

    return server
  }
  
  main().then(server => {
    console.log('Server running at:', server.info.uri)
  }).catch(err => {
    console.log(err)
    process.exit(1)
  })

 