import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import UploadComponent from "@components/uploadpage";
import Unauthorised from "@components/unauthorised";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";

export const dynamic = "force-dynamic";

export async function generateMetadata() {
	const supabase = createServerComponentClient({ cookies });

	const {
		data: { user },
	} = await supabase.auth.getUser();

	if(user) {
		return {
			title: "Vložte vzkaz",
		};
	}

	const cookieStore = cookies();
	const heslo = cookieStore.get("pass");

	if (!heslo) {
		return {
			title: "Tady nic není!",
		};
	}

	let decoded;

	try {
		decoded = await jwt.verify(heslo.value, process.env.JWT_HESLO);
	} catch (error) {
		throw new Error("Něco se pokazilo při dekodovaní hesla");
	}

	if (!decoded?.pass || decoded.pass != process.env.HESLO) {
		return {
			title: "Tady nic není!",
		};
	}

	return {
		title: "Vložte vzkaz",
	};
}

export default async function NahratPage() {
	const supabase = createServerComponentClient({ cookies });

	const {
		data: { user },
	} = await supabase.auth.getUser();

	if(user) {
		return <UploadComponent />;
	}

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
