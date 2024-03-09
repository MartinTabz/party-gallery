import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import ShowCase from "@components/showcase";

export const dynamic = "force-dynamic";

export default async function Loading() {
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

	const supabase = createServerComponentClient({ cookies });
	const { data: posts, error } = await supabase
		.from("posts")
		.select("*")
		.order("created_at", { ascending: false });

	if (error) {
		throw new Error(error.message);
	}

	return (
		<main>
			<h1>Vzkazy</h1>
			<ShowCase posts={posts} />
		</main>
	);
}
