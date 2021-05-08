const mongoose = require('mongoose');
require('dotenv').config( {path:'variables.env'} );

//Conexion a la base de datos
const conectarDB = async () =>{
  try {
    await mongoose.connect(process.env.DB_MONGO,{
      //parametros de la base de datos
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useFindAndModify: false,
      useCreateIndex: true,
    });
    console.log("base de datos conectada");
  } catch (error) {
    console.log("Hubo un error en la conecion de la DB",error);
    process.exit(1);// detener la aplicacion
  }
}

module.exports = conectarDB;