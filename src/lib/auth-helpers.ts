import { getServerSession } from "next-auth";
import { authOptions } from "./auth";
import { NextResponse } from "next/server";

export async function checkAdminAuth() {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    return {
      authorized: false,
      response: NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    };
  }
  
  if (!session.user.isAdmin) {
    return {
      authorized: false,
      response: NextResponse.json({ error: "Forbidden - Admin access required" }, { status: 403 })
    };
  }
  
  return {
    authorized: true,
    session
  };
}