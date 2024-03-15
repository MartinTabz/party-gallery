import { cookies } from "next/headers";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import MessageManage from "@components/messagemanage";

export const dynamic = "force-dynamic";

export async function generateMetadata() {
	const supabase = createServerComponentClient({ cookies });

	const {
		data: { user },
	} = await supabase.auth.getUser();

	if (!user) {
		return {
			title: "Nejste oprávnění k přístupu!",
		};
	}

	return {
		title: "Správa vzkazů - Administrace",
	};
}

export default async function AdminPage() {
	const supabase = createServerComponentClient({ cookies });

	const { data: posts, error } = await supabase
		.from("posts")
		.select("*")
		.order("created_at", { ascending: false });

	const { data: bucket } = await supabase.storage.from("photos").list();

	if (error) {
		throw new Error("Nepodařilo se načíst příspěvky");
	}

	const updatedPosts = posts.map((dataItem) => {
		const matchingFileInfo = bucket.find(
			(fileInfoItem) => fileInfoItem.name === dataItem.image_name
		);
		if (matchingFileInfo) {
			return {
				...dataItem,
				contentLength: matchingFileInfo.metadata.contentLength,
			};
		}
		return dataItem;
	});

	return (
		<MessageManage
			emailPassword={process.env.VSECHNY_FOTKY_HESLO}
			posts={updatedPosts}
		/>
	);
}
