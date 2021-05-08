//Importacion de los modelos
const Usuario = require('../models/Usuario');
const Proyecto = require('../models/Proyecto');
const Tarea = require('../models/Tarea');

//importacion de librerias
const bcryptjs = require('bcryptjs');
const jwt = require('jsonwebtoken');

require('dotenv').config({path: 'variables.env' });

//creacion y firma de un jsonwebtoken
const crearToken = (usuario, secreta, expiresIn) =>{
  const {id, email, nombre} = usuario;

  return jwt.sign( {id, email, nombre}, secreta, {expiresIn});
}

//resolvers
const resolvers ={

  /**
   * @description los Query son para obtener datos
   * @param {_} es el root y es el resultado del type anterior, se usa poco
   * @param {id, input} son los argumentos que se pasan hacia este valor, vienen desde los schemas.js
   * @param {cxt} es el contex para revisar que usuario esta registrado
   */

  Query: {
    obtenerProyectos: async (_, {}, ctx) =>{

      //Se guarda en proyectos lo que desde el modelo Proyecto con un usuario en especifico nos retorna
      const proyectos = await Proyecto.find({creador: ctx.usuario.id});

      return proyectos
    },

    obtenerTareas: async (_ ,{input}, ctx) => {
      const tareas =await Tarea.find({ creador: ctx.usuario.id }).where('proyecto').equals(input.proyecto);

      return tareas;
    },

    obtenerTodasTareas: async (_, {}, ctx) => {

      const todasTareas = await Tarea.find({ creador: ctx.usuario.id });

      return todasTareas;
    }
  },

  /**
   * @description las Mutation son para crear, actualizar o eliminar
   * @param {_} es el root y es el resultado del type anterior, se usa poco
   * @param {id, input, estado} son los argumentos que se pasan hacia este valor, vienen desde los schemas.js
   * @param {cxt} es el contex para revisar que usuario esta registrado
   */
  Mutation: {

    crearUsuario: async (_, {input}, ctx) =>{

      const {email, password} = input;

      //verificacion si el usuario existe
      const usuarioExiste = await Usuario.findOne({email});

      //si el usuario exite
      if(usuarioExiste){
        throw new Error('El usuario ya esta registrado')
      }

      try {

        //hashear password
        const salt = await bcryptjs.genSalt(10);

        //se le dice al password que se hashee con la configuración del salt
        input.password = await bcryptjs.hash(password, salt);

        //registrar nuevo usuario
        const nuevoUsuario = new Usuario(input);
        // console.log(nuevoUsuario);

        nuevoUsuario.save();
        return 'Usuario Creado correctamente'
      } catch (error) {
        console.log("error al guardar un usuario",error);
      }
    },

    autenticarUsuario: async (_,{input}) => {
      const {email, password} = input;

      //Verificacion de existencia de usuario
      const usuarioExiste = await Usuario.findOne({email});

      if(!usuarioExiste){
        throw new Error('El usuario no existe');
      }

      //Verificacion de password correcto
      const passwordCorrect = await bcryptjs.compare(password, usuarioExiste.password);

      if(!passwordCorrect){
        throw new Error('El password no es correcto');
      }

      //Dar acceso a la app
      return {
        token: crearToken(usuarioExiste, process.env.SECRETA, '24hr')
      }
    },

    nuevoProyecto:  async (_,{input}, ctx) => {
      try {
        //se guarda lo que llega por el input en la instancia proyecto
        const proyecto = new Proyecto(input);

        //asociamos al creador del proyecto
        proyecto.creador = ctx.usuario.id;
        console.log("ctx.usuario.id",ctx.usuario.id);

        //guardamos en la base de datos
        const resultado = await proyecto.save();

        return resultado;
      } catch (error) {
        console.log("error al ingresar un proyecto",error);
      }
    },

    actualizarProyecto: async(_,{id, input}, ctx)=>{

      //Confirmar que el proyecto existante
      let proyecto = await Proyecto.findById(id);

      if(!proyecto){
        throw new Error('El proyecto no existe');
      }

      //Revisar que si la persona que trata de editarlo, es el creado
      if(proyecto.creador.toString() !== ctx.usuario.id){
        throw new Error('No tienes las credenciales para editar');
      }
      //Guardar el proyecto actualizado
      proyecto = await Proyecto.findOneAndUpdate({_id: id}, input, {new: true});

      return proyecto;
    },

    eliminarProyecto : async (_,{id},ctx)=>{

      //confirmar si el proyecto existe
      let proyecto = await Proyecto.findById(id);

      if(!proyecto){
        throw new Error('El Proyecto no existe');
      }

        //Revisar que si la persona que trata de eliminiarlo, es el creado
        if(proyecto.creador.toString() !== ctx.usuario.id){
          throw new Error('No tienes las credenciales para editar');
        }

      //borrar el proyecto
      await Proyecto.findOneAndDelete({_id: id});

      return "Proyecto eliminado";

    },
    // deleteMany

    nuevaTarea : async (_,{ input }, ctx) => {

      try {

        //Se instancia el modelo Tarea que se llena con el argumento input que le envia el schema
        const tarea = new Tarea(input);

        //Se agrega el creador usando el ctx
        tarea.creador = ctx.usuario.id;

        //Se guarda la instancia tarea
        const resultado = await tarea.save();

        //Retornamos el resultado
        return resultado;
      } catch (error) {
        console.log("No se pudo ingresar la nueva tarea",error);
      }
    },
    actualizarTarea: async (_,{id, input, estado},ctx) => {

      // Verificar si la tarea existe
      let tarea = await Tarea.findById(id);

      if(!tarea){
        throw new Error('Tarea no encontrada');
      }

      //Verificar si la persona es la creadora
      if(tarea.creador.toString() !== ctx.usuario.id){
        throw new Error('No tiene credenciales para editar esta tarea');
      }

      //Asignar en el input el Booleano del estado
      input.estado = estado;

      //Guardar y retornar la tarea
      tarea = await Tarea.findOneAndUpdate({_id: id}, input, {new: true});

      return tarea;
    },
    eliminarTarea: async(_,{id}, ctx) => {

      //Confirmar si la tarea existe
      let tarea = await Tarea.findById(id);

      if(!tarea){
        throw new Error('La tarea no existe');
      }

      //Verificar si el usuario es el creador de la tareas
      if(tarea.creador.toString() !== ctx.usuario.id){
        throw new Error('Usted no tiene credenciales para eliminar la tarea');
      }

      //Eliminar la tarea
      await Tarea.findOneAndDelete({_id : id});

      return "La tarea se ha eliminado"
    }
  }
}

module.exports = resolvers;