import { cookies } from "next/headers";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import MessageDownload from "@components/messagedownload";
import jwt from "jsonwebtoken";
import Unauthorised from "@components/unauthorised";

export const dynamic = "force-dynamic";

export default async function StahnoutVzkazyPage() {
	const cookieStore = cookies();
	const heslo = cookieStore.get("allphpass");

	if (!heslo) {
		return <Unauthorised />;
	}

	let decoded;

	try {
		decoded = await jwt.verify(heslo.value, process.env.JWT_HESLO);
	} catch (error) {
		throw new Error("Něco se pokazilo při dekodovaní hesla");
	}

	if (!decoded?.pass || decoded.pass != process.env.VSECHNY_FOTKY_HESLO) {
		return <Unauthorised />;
	}

	const supabase = createServerComponentClient({ cookies });
	const { data: messages, error } = await supabase.from("posts").select("*");
	if (error) {
		throw new Error("Něco se pokazilo při načítání vzkazů");
	}

	return (
		<main>
			<div>
				{messages.map((msg) => (
					<MessageDownload msg={msg} />
				))}
			</div>
		</main>
	);
}
