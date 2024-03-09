import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";

export async function GET(request) {
	const requestUrl = new URL(request.url);
	const pass = requestUrl.searchParams.get("h");

	if (pass) {
		// const week = 24 * 60 * 60 * 1000 * 7;
      var token = jwt.sign({ pass: process.env.HESLO }, process.env.JWT_HESLO);
		cookies().set("pass", token);
	}

	const redirectURL = new URL("/", request.url);
	return NextResponse.redirect(redirectURL.toString());
}
