"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import axios from "axios";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

export default function MessageManage({ posts: rawPosts }) {
	const supabase = createClientComponentClient();
	const [posts, setPosts] = useState(rawPosts);

	const [selectedPostId, setSelectedPostId] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const [popupMessage, setPopupMessage] = useState("");

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

	const deletePost = async () => {
		setIsLoading(true);

		try {
			const { data } = await axios.delete(`/api/delete-post/${selectedPostId}`);
			if (data?.success == true) {
				const updatedPostsArray = posts.filter(
					(item) => item.id !== selectedPostId
				);
				setPosts(updatedPostsArray);
				setSelectedPostId("");
				setPopupMessage("Vzkaz byl úspěšně vymazán");
			} else if (data?.success == false) {
				setSelectedPostId("");
				setPopupMessage("Něco se pokazilo při mazání vzkazu");
			}
		} catch (error) {
			setPopupMessage("Něco se pokazilo při mazání vzkazu");
		}

		setIsLoading(false);
	};

	return (
		<>
			{popupMessage && (
				<div>
					<span>{popupMessage}</span>
					<button onClick={() => setPopupMessage("")}>X</button>
				</div>
			)}
			{selectedPostId && (
				<div>
					<div>
						{isLoading ? (
							<span>Vzkaz se maže</span>
						) : (
							<>
								<h2>Jste si jisti, že chcete odebrat tento vzkaz?</h2>
								<div>
									<button onClick={() => deletePost()}>Potvrdit</button>
									<button onClick={() => setSelectedPostId("")}>Zrušit</button>
								</div>
							</>
						)}
					</div>
				</div>
			)}
			<div>
				{posts.map((post) => (
					<div key={post.id}>
						<div>
							<div>
								<Image
									src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/photos/${post.image_name}`}
									alt="Fotka u vzkazu"
									width={200}
									height={200}
								/>
							</div>
							<div>
								<span>ID: {post.id}</span>
								<span>Vytvořeno {post.created_at}</span>
								<h2>
									<b>Jmeno:</b> {post.name}
								</h2>
								<p>
									<b>Vzkaz:</b> {post.message}
								</p>
							</div>
						</div>
						<div>
							<button onClick={() => setSelectedPostId(post.id)}>
								Odstranit
							</button>
						</div>
					</div>
				))}
			</div>
		</>
	);
}
