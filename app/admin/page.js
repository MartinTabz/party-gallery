import { cookies } from "next/headers";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import MessageManage from "@components/messagemanage";

export default async function AdminPage() {
	const supabase = createServerComponentClient({ cookies });

	const { data: posts, error } = await supabase
		.from("posts")
		.select("*")
		.order("created_at", { ascending: false });

   if(error) {
      throw new Error("Nepodařilo se načíst příspěvky")
   }

	return (
		<>
			<h1>Vítej v administraci</h1>
			<MessageManage posts={posts} />
		</>
	);
}
