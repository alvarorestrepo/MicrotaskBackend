const { gql } = require('apollo-server');


//types definitions
const typeDefs = gql`

  type Proyecto {
    nombre: String
    id: ID
  }

  type Tarea {
    nombre: String
    id: ID
    proyecto: String
    estado: Boolean
  }
  type Token {
    token: String
  }

  type Query {
    #Obtener los proyectos
    obtenerProyectos: [Proyecto]

    #Obtener las tareas
    obtenerTareas (input: ProyectoIDinput): [Tarea]

    #Obtener todas las tareas
    obtenerTodasTareas: [Tarea]
  }

  input ProyectoIDinput{
    proyecto: String!
  }

  input UsuarioInput{
    nombre: String!
    email: String!
    password: String!
  }

  input AutenticarInput {
    email: String!
    password: String!
  }

  input ProyectoInput {
    nombre: String!
  }

  input TareaInput{
    nombre: String!
    proyecto: String!
  }

  type Mutation {

    # Mutation de los usuarios
    crearUsuario (input: UsuarioInput): String
    autenticarUsuario (input: AutenticarInput): Token

    # Mutation de los Proyectos
    nuevoProyecto (input: ProyectoInput): Proyecto
    actualizarProyecto(id:ID!, input: ProyectoInput) : Proyecto
    eliminarProyecto (id: ID!) : String

    # Mutation de las tareas
    nuevaTarea (input: TareaInput): Tarea
    actualizarTarea (id: ID!,input: TareaInput, estado: Boolean): Tarea
    eliminarTarea (id: ID!): String

  }
`;

module.exports = typeDefs;
