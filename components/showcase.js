"use client";

import { useState, useEffect } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import Image from "next/image";

export default function ShowCase({ posts: rawPosts, delay: delayString }) {
	const supabase = createClientComponentClient();

	const [posts, setPosts] = useState(rawPosts);
	const [delay, setDelay] = useState(5000);
	const [currentPost, setCurrentPost] = useState(0);

	useEffect(() => {
		const delayInt = parseInt(delayString, 10);

		if (!isNaN(delayInt) && delayInt > 0) {
			setDelay(delayInt);
		} else {
			console.log(
				"Nepodařilo se nastavit delay z nastavení. Nastavuje se 5 sekund"
			);
			setDelay(5000);
		}
	}, [delayString]);

	useEffect(() => {
		const channels = supabase
			.channel("delay-update")
			.on(
				"postgres_changes",
				{
					event: "UPDATE",
					schema: "public",
					table: "settings",
					filter: "name=eq.presentation_delay",
				},
				(payload) => {
					const delayInt = parseInt(payload.new.value, 10);

					if (!isNaN(delayInt) && delayInt > 0) {
						setDelay(delayInt);
					} else {
						console.log(
							"Nepodařilo se nastavit delay z nastavení. Nastavuje se 5 sekund."
						);
						setDelay(5000);
					}
				}
			)
			.subscribe();

		return () => {
			supabase.removeChannel(channels);
		};
	}, [supabase]);

	useEffect(() => {
		const channelsTwo = supabase
			.channel("new-message")
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
					setCurrentPost(currentPost + 1);
				}
			)
			.subscribe();

		return () => {
			supabase.removeChannel(channelsTwo);
		};
	}, [supabase]);

	useEffect(() => {
		const interval = setInterval(() => {
			setCurrentPost((prevPost) => (prevPost + 1) % posts.length);
		}, delay);

		return () => clearInterval(interval);
	}, [delay, posts]);

	return (
		<section>
			<div>
				{posts[currentPost].name && <h2>{posts[currentPost].name}</h2>}
				<Image
					src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/photos/${posts[currentPost].image_name}`}
					alt="Fotka u vzkazu"
					width={300}
					height={200}
				/>
				{posts[currentPost].message && <p>{posts[currentPost].message}</p>}
			</div>
		</section>
	);
}
