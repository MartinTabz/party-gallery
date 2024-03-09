import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { getServiceSupabase } from "@utils/supabase";

export const dynamic = "force-dynamic";

export async function DELETE(request, { params }) {
	const supabaseAuth = createRouteHandlerClient({ cookies });

	const {
		data: { user },
	} = await supabaseAuth.auth.getUser();

	if (!user) {
		return new Response(
			JSON.stringify({
				success: false,
			})
		);
	}

	const id = params.id;

	if (!id) {
		return new Response(
			JSON.stringify({
				success: false,
			})
		);
	}

	const supabase = getServiceSupabase();

	const { data: post, error: post_error } = await supabase
		.from("posts")
		.select("*")
		.eq("id", id)
		.single();

	if (post_error || !post) {
		return new Response(
			JSON.stringify({
				success: false,
			})
		);
	}

	const { data: bucket_files_deletion, error: bucket_files_deletion_error } =
		await supabase.storage.from("photos").remove(post.image_name);

	if (bucket_files_deletion_error || !bucket_files_deletion) {
		return new Response(
			JSON.stringify({
				success: false,
			})
		);
	}

	const { error: post_deletion_error } = await supabase
		.from("posts")
		.delete()
		.eq("id", id);

	if (post_deletion_error) {
		return new Response(
			JSON.stringify({
				success: false,
			})
		);
	}

	return new Response(
		JSON.stringify({
			success: true,
		})
	);
}
