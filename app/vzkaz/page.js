import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import UploadComponent from "@components/uploadpage";
import Unauthorised from "@components/unauthorised";

export const dynamic = "force-dynamic";

export default async function NahratPage() {
	const cookieStore = cookies();
	const heslo = cookieStore.get("pass");

	if (!heslo) {
		return <Unauthorised />;
	}

	let decoded;

	try {
		decoded = await jwt.verify(heslo.value, process.env.JWT_HESLO);
	} catch (error) {
		throw new Error("Něco se pokazilo při dekodovaní hesla");
	}

	if (!decoded?.pass || decoded.pass != process.env.HESLO) {
		return <Unauthorised />;
	}

	return <UploadComponent />;
}
