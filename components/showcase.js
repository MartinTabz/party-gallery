"use client";

import { useState, useEffect } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import Image from "next/image";

export default function ShowCase({ posts: rawPosts }) {
	const supabase = createClientComponentClient();

	const [posts, setPosts] = useState(rawPosts);

	useEffect(() => {
		const channels = supabase
			.channel("custom-filter-channel")
			.on(
				"postgres_changes",
				{
					event: "INSERT",
					schema: "public",
					table: "posts",
				},
				(payload) => {
					console.log("Change received!", payload.new);
					setPosts((posts) => [payload.new, ...posts]);
				}
			)
			.subscribe();

		return () => {
			supabase.removeChannel(channels);
		};
	}, [supabase]);

	return (
		<div>
			{posts.map((post) => (
				<div key={post.id}>
					<Image
						src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/photos/${post.image_name}`}
						alt="Fotka u vzkazu"
						width={300}
						height={200}
					/>
					{post.name && <h2>{post.name}</h2>}
					{post.message && <p>{post.message}</p>}
					<hr />
				</div>
			))}
		</div>
	);
}
