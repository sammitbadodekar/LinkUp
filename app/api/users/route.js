import { NextResponse } from "next/server";
import { connect } from "@/utils/db";
import User from "@/models/UserModel";

export const PUT = async (req) => {
  try {
    await connect();
    const users = await User.find();
    return new NextResponse(users);
  } catch (error) {
    return new NextResponse(error);
  }
};