import { NextRequest, NextResponse } from "next/server";

function unauthorized() {
  return new NextResponse("Authentication required", {
    status: 401,
    headers: {
      "WWW-Authenticate": 'Basic realm="Admin Area"',
    },
  });
}

export function middleware(req: NextRequest) {
  const adminUser = process.env.ADMIN_USERNAME;
  const adminPass = process.env.ADMIN_PASSWORD;

  if (!adminUser || !adminPass) {
    return NextResponse.next();
  }

  const auth = req.headers.get("authorization") || "";
  if (!auth.startsWith("Basic ")) {
    return unauthorized();
  }

  const base64 = auth.replace("Basic ", "");
  let decoded = "";
  try {
    decoded = Buffer.from(base64, "base64").toString("utf-8");
  } catch {
    return unauthorized();
  }

  const [user, pass] = decoded.split(":");
  if (user !== adminUser || pass !== adminPass) {
    return unauthorized();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
