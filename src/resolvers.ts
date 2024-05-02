import jwt from "jsonwebtoken";

// import Schema
import Book from "../models/book.js";
import User from "../models/user.js";

// Function to verify a JWT
function verifyToken(token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      return decoded;
    } catch (err) {
      throw new Error("Invalid token");
    }
  }
  
  export const resolvers = {
    // graphql query
    Query: {
        // get single user by email
      async getUserByEmail(_, { email }) {
        return await User.findOne({ email });
      },
    //   get all user
      async getUsers(_, { limit }) {
        return await User.find().limit(limit);
      },
    //   get single book by id
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
          const user = User.findOne({ email })
          return user;
        }
        throw new Error("I don't know who are you");
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
          process.env.JWT_SECRET, {expiresIn: "7d"}
        );
  
        return { userId: user._id, token };
      },
    },
  };