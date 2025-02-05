import UserModel from "../models/user.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const logServerError = (action, response, err) => {
  console.error(`An error occured while trying to ${action}: ${err}`);
  response.status(500).json({
    success: false,
    message: "An error occured in the server",
    error: err,
  });
};

export async function createNewUserController(req, res) {
  try {
    // get the user info from the client form
    const { username, email, password, dateOfBirth, role } = req.body;

    // check if a user with that info already exists in the database
    const isUserExists = await UserModel.findOne({
      $or: [{ username }, { email }],
    });

    if (isUserExists) {
      return res.status(400).json({
        success: false,
        message:
          "A user with that email or username already exists, please try with a different email or username",
      });
    }

    // generate a random salt value (for uniqueness of password)and hash the new user's password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // create the new user in the db
    const newUser = await UserModel.create({
      username,
      email,
      password: hashedPassword,
      role: role || "user",
      dateOfBirth: new Date(dateOfBirth),
    });

    if (newUser) {
      return res.status(201).json({
        success: true,
        message: "User registered successfully",
        data: newUser,
      });
    } else {
      return res.status(400).json({
        success: true,
        message: "User not registered",
      });
    }
  } catch (err) {
    logServerError("register new user", res, err);
  }
}

export async function loginUserController(req, res) {
  try {
    // get the user login info which includes email or username and password
    const { usernameOrEmail, password } = req.body;

    // check if there is a user with those credentials in the database
    const existingUser = await UserModel.findOne({
      $or: [{ username: usernameOrEmail }, { email: usernameOrEmail }],
    });

    if (!existingUser) {
      return res.status(404).json({
        loginSuccess: false,
        message:
          "User not found please check the username or email and try again or register to proceed",
      });
    }

    // validate the password
    const isValidPassword = await bcrypt.compare(
      password,
      existingUser.password
    );
    if (!isValidPassword) {
      return res.status(404).json({
        loginSuccess: false,
        message: "Invalid password, please check it and try again",
      });
    }

    //create a bearer token for the user
    const accessToken = jwt.sign(
      {
        userId: existingUser._id,
        username: existingUser.username,
        email: existingUser.email,
        role: existingUser.role,
      },
      process.env.JWT_SECRET_KEY,
      { expiresIn: "60m" }
    );
    // send token to the client
    res.status(200).json({
      loginSuccess: true,
      message: "Login successful",
      accessToken,
    });
  } catch (err) {
    logServerError("login the user", res, err);
  }
}

export async function changePasswordController(req, res) {
  try {
    // get user old password and requested new password
    const { oldPassword, newPassword } = req.body;
    const userId = req.userInfo.userId;

    // check if old password entered by user matches what is currently in the database
    const foundUser = await UserModel.findById(userId);
    if (!foundUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }
    const isValidOldPassword = await bcrypt.compare(
      oldPassword,
      foundUser.password
    );

    if (!isValidOldPassword) {
      return res.status(404).json({
        success: false,
        message: "Old password is not correct, please try again",
      });
    }

    // update the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    const updatedPassword = await UserModel.findByIdAndUpdate(
      userId,
      { password: hashedPassword },
      { new: true }
    );

    if (!updatedPassword) {
      return res.status(400).json({
        success: false,
        message: "Unable to update password, please try again later",
      });
    }
    res.status(200).json({
      success: false,
      message: "Successfully updated the user password",
      createdAt: updatedPassword.createdAt,
      updatedAt: updatedPassword.updatedAt,
    });
  } catch (err) {
    logServerError("change user password", res, err);
  }
}
