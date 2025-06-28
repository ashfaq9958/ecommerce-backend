import { User } from "../models/user.model.js";
import { sendMail } from "../utils/email/sendEmail.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.config.js";
import jwt from "jsonwebtoken";
import {
  generateAccessToken,
  generateRefreshToken,
} from "../utils/token.utils.js";

export const registerUser = asyncHandler(async (req, res) => {
  const { fullname, username, password, email } = req.body;

  if (![fullname, username, password, email].every(Boolean)) {
    throw new ApiError(
      400,
      "All fields (fullname, email, username, password) are required."
    );
  }

  const existingUser = await User.findOne({
    $or: [{ username: username.toLowerCase() }, { email: email.toLowerCase() }],
  });

  if (existingUser) {
    throw new ApiError(409, "Email or username already exists.");
  }

  let avatarUrl = "";
  if (req.file?.path) {
    const uploadedAvatar = await uploadOnCloudinary(req.file.path);
    if (!uploadedAvatar?.url) {
      throw new ApiError(500, "Failed to upload avatar image.");
    }
    avatarUrl = uploadedAvatar.url;
  }

  const newUser = await User.create({
    fullname: fullname.trim(),
    username: username.toLowerCase().trim(),
    email: email.trim(),
    avatar: avatarUrl,
    password,
  });

  // ✅ Send verification email here
  await sendMail({
    email: newUser.email,
    emailType: "VERIFY",
    userId: newUser._id,
  });

  const sanitizedUser = await User.findById(newUser._id).select(
    "-password -refreshToken"
  );

  if (!sanitizedUser) {
    throw new ApiError(
      500,
      "An unexpected error occurred while retrieving user data."
    );
  }

  return res
    .status(201)
    .json(new ApiResponse(201, sanitizedUser, "User registered successfully"));
});

export const loginUser = asyncHandler(async (req, res) => {
  const { username, email, password } = req.body;

  // Validate input
  if (!email && !username) {
    throw new ApiError(400, "Please provide email or username.");
  }

  if (!password) {
    throw new ApiError(400, "Password is required.");
  }

  // Find user by email or username
  const user = await User.findOne({
    $or: [
      { username: username?.toLowerCase().trim() },
      { email: email?.toLowerCase().trim() },
    ],
  });

  if (!user) {
    throw new ApiError(404, "Invalid credentials.");
  }

  // Validate password
  const isPasswordValid = await user.comparePassword(password);
  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid credentials.");
  }

  // Check if email verified (optional)
  if (!user.isEmailVerified) {
    throw new ApiError(403, "Please verify your email before logging in.");
  }

  // Generate tokens
  const accessToken = generateAccessToken(user._id, user.role);
  const refreshToken = generateRefreshToken(user._id);

  // Save refresh token in DB
  user.refreshToken = refreshToken;
  await user.save({ validateBeforeSave: false });

  // Prepare user response
  const sanitizedUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  // Set refresh token in HttpOnly cookie
  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  };

  return res
    .status(200)
    .cookie("refreshToken", refreshToken, cookieOptions)
    .json(
      new ApiResponse(
        200,
        {
          accessToken, // sent in JSON
          user: sanitizedUser,
        },
        "User logged in successfully"
      )
    );
});

export const logoutUser = asyncHandler(async (req, res) => {
  const userId = req.user?._id;

  if (!userId) {
    throw new ApiError(401, "Unauthorized");
  }

  // Remove refreshToken from DB
  await User.findByIdAndUpdate(
    userId,
    {
      $unset: { refreshToken: "" },
    },
    { new: true }
  );

  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  };

  // Clear refresh token cookie
  res.clearCookie("refreshToken", cookieOptions);

  return res
    .status(200)
    .json(new ApiResponse(200, null, "User logged out successfully"));
});

export const refreshAccessToken = asyncHandler(async (req, res) => {
  const oldRefreshToken =
    req.cookies.refreshAccessToken || req.body.refreshToken;

  if (!oldRefreshToken) {
    throw new ApiError(401, "Refresh token missing");
  }

  try {
    const decoded = jwt.verify(
      oldRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );
    const user = await User.findById(decoded._id);

    if (!user || user.refreshToken !== oldRefreshToken) {
      throw new ApiError(403, "Invalid refresh token");
    }

    const newAccessToken = generateAccessToken(user._id, user.role);
    const newRefreshToken = generateRefreshToken(user._id);

    user.refreshToken = newRefreshToken;
    await user.save({ validateBeforeSave: false });

    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    };

    res.cookie("refreshToken", newRefreshToken, cookieOptions);

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          { accessToken: newAccessToken },
          "Token refreshedX"
        )
      );
  } catch (error) {
    throw new ApiError(403, "Invalid or expired refresh token");
  }
});
