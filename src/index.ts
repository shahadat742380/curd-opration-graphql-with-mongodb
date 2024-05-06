import { ApolloServer } from "@apollo/server";
import { startStandaloneServer } from "@apollo/server/standalone";
import jwt from "jsonwebtoken";
import { connect } from "mongoose";
import dotenv from "dotenv";
dotenv.config();

// import typeDefs
// import { typeDefs } from "./typeDefs.js";

// import Schema
import Book from "../models/book.js";
import User from "../models/user.js";

// MongoDB url
const MONGODB = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.c4tsixa.mongodb.net/Books?retryWrites=true&w=majority&appName=Cluster0`;

const typeDefs = `#graphql
    type Book{
        _id: String
        author: String
        title: String
        year: String
    }

    input BookInput{
        author: String
        title: String
        year: String
    }

    type User{
      _id: String
      firstName: String
      lastName: String
      email: String
      password: String
    }

    input UserInput{
      firstName: String!
      lastName: String
      email: String!
      password: String!
    }

    type AuthData {
      userId: ID!
      token: String!
  }

    type Query {
        getUserByEmail(email: String!): User
        getUsers(limit: Int): [User]!
        getBook(ID: ID!): Book
        getBooks(limit: Int): [Book]!
        booksPerPage(page: Int!, perPage: Int!): [Book!]!
        getCurrentLoggedInUser: User!
    }

    type Mutation {
        createUser(userInput:UserInput ): String!
        createBook(bookInput: BookInput): String!
        updateBook(ID: ID!, bookInput: BookInput): String!
        deleteBook(ID: ID!): String!
        login(email: String!, password: String!): AuthData!
    }
`;


// Function to verify a JWT
function verifyToken(token) {
  if(token){
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return decoded;
  }

  return {message: "token is null", status: 400}
 
}

const resolvers = {
  // graphql query
  Query: {
    // get single user by email
    async getUserByEmail(_, { email }) {
      return await User.findOne({ email });
    },
    //  get all user
    async getUsers(_, { limit }) {
      return await User.find().limit(limit);
    },
    //  get single book by id
    async getBook(_, { ID }) {
      return await Book.findById(ID);
    },
    //   get all books
    async getBooks(_, { limit }) {
      return await Book.find().limit(limit);
    },
    // Pagination
    async booksPerPage(_, { page, perPage }) {
      return await Book.find()
        .skip((page - 1) * perPage)
        .limit(perPage);
    },
    // get login user
    getCurrentLoggedInUser: async (_: any, args: any, context: any) => {
      if (context) {
        // Verify the JWT in the request headers
        const token = context.headers.authorization;
        const decodedToken = verifyToken(token);
        // @ts-ignore
        const email = decodedToken.email;
        const user = User.findOne({ email });
        return user;
      }
      return {message: "Authorization fail", status: 400}
    },
  },

  // graphql mutation
  Mutation: {
    // create User
    async createUser(
      _,
      { userInput: { firstName, lastName, email, password } }
    ) {
      const res = await new User({
        firstName,
        lastName,
        email,
        password,
      }).save();
      return res._id;
    },

    // Create Book
    async createBook(_, { bookInput: { author, title, year } }) {
      const res = await new Book({ author, title, year }).save();
      return res._id;
    },

    // Update Book
    async updateBook(_, { ID, bookInput: { author, title, year } }) {
      await Book.updateOne({ _id: ID }, { $set: { author, title, year } });

      return ID;
    },

    // Delete Book
    async deleteBook(_, { ID }) {
      await Book.deleteOne({ _id: ID });
      return ID;
    },
    //   login user and create token
    async login(_, { email, password }) {
      const user = await User.findOne({ email });

      if (!user) {
        throw new Error("User not found");
      }

      if (user.password !== password) {
        throw new Error("Password is incorrect");
      }

      const token = jwt.sign(
        { userId: user._id, email: user.email },
        process.env.JWT_SECRET,
        { expiresIn: "7d" }
      );

      return { userId: user._id, token };
    },
  },
};

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
