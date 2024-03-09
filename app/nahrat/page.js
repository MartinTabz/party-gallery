import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import UploadComponent from "@components/uploadpage";

export const dynamic = "force-dynamic";

export default async function NahratPage() {
	const cookieStore = cookies();
	const heslo = cookieStore.get("pass");

	if (!heslo) {
		return (
			<main>
				<h1>Něco se pokazilo</h1>
				<span>Error 404</span>
			</main>
		);
	}

	let decoded;

	try {
		decoded = await jwt.verify(heslo.value, process.env.JWT_HESLO);
	} catch (error) {
		throw new Error("Něco se pokazilo při dekodovaní hesla");
	}

	if (!decoded?.pass || decoded.pass != process.env.HESLO) {
		return (
			<main>
				<h1>Něco se pokazilo</h1>
				<span>Error 404</span>
			</main>
		);
	}

	return <UploadComponent />;
}
