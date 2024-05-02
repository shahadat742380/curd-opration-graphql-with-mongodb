import { ApolloServer } from "@apollo/server";
import { startStandaloneServer } from "@apollo/server/standalone";
import { connect } from "mongoose";
import dotenv from "dotenv";
dotenv.config();


// import typeDefs
import { typeDefs } from "./typeDefs.js";
import { resolvers } from "./resolvers.js";

// MongoDB url
const MONGODB = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.c4tsixa.mongodb.net/Books?retryWrites=true&w=majority&appName=Cluster0`;


// Connect DB
await connect(MONGODB);

// Server
const server = new ApolloServer({
  typeDefs,
  resolvers,
});


const port = Number.parseInt(process.env.PORT) || 4000;

// Apollo server
const { url } = await startStandaloneServer(server, {
  listen: { port: port },
  context: async ({ req, res }) => {
    return req;
  },
});

console.log(`Server is ready at ${url}`);
