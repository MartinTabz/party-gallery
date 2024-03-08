import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import ShowCase from "@components/showcase";

export default async function Loading() {
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
