import { Schema, model } from "mongoose";

interface IUser {
  id?: String;
  firstName: String;
  lastName?: String;
  email: String;
  password: String;
}

const UserSchema = new Schema<IUser>({
  id: String,
  firstName: { type: String, required: true },
  lastName: { type: String },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
});

const User = model<IUser>("users", UserSchema);

export default User;
