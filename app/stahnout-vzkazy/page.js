import { cookies } from "next/headers";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import MessageDownload from "@components/messagedownload";

export default async function StahnoutVzkazyPage() {
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
