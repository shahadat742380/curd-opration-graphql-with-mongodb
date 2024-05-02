export const typeDefs = `#graphql
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
