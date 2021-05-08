const { ApolloServer } = require('apollo-server');
const jwt = require('jsonwebtoken');
require('dotenv').config('variables.env');

//Import los Schemas con los typesdefinitions
const typeDefs = require('./db/schema');

//Import los Resolvers
const resolvers = require('./db/resolvers');

//Importar la conexion a la base de datos
const conectarDB = require('./config/db');

//Conectar a la base de datos
conectarDB();

//servidor de apollo
const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: ( {req} ) => {
    //recoger el token del usuario si lo trae, si no, dejarlo vacio
    const token = req.headers['authorization'] || '';

    //si hay token verificarlo con jwt.verify, le pasamos el token y la palabra secreta y retornamos el resultado
    if(token){
      try {
        const usuario = jwt.verify(token.replace('Bearer ',''), process.env.SECRETA)
        console.log("usuario",usuario);
        return {
          usuario
        }
      } catch (error) {
        console.log("error en el token del usuario",error);
      }
    }
  }});

server.listen({ port: process.env.PORT || 4000}).then(({ url }) =>{
  console.log(`servidor listo para ${url}`);
})