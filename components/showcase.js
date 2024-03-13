"use client";

import { useState, useEffect, useRef } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { AnimatePresence, motion } from "framer-motion";
import style from "@styles/presentation.module.css";
import Image from "next/image";

const variants = {
	enter: (direction) => {
		return {
			x: direction > 0 ? 1000 : -1000,
			opacity: 0,
		};
	},
	center: {
		zIndex: 1,
		x: 0,
		opacity: 1,
	},
	exit: (direction) => {
		return {
			zIndex: 0,
			x: direction < 0 ? 1000 : -1000,
			opacity: 0,
		};
	},
};

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
				async (payload) => {
					const { data } = await supabase.storage
						.from("photos")
						.download(payload.new.image_name);
					const imgUrl = URL.createObjectURL(data);
					console.log(imgUrl);
					payload.new.image_name = imgUrl;
					console.log(payload.new);
					setPosts((posts) => [...posts, payload.new]);
				}
			)
			.subscribe();

		return () => {
			supabase.removeChannel(channelsTwo);
		};
	}, [supabase]);

	useEffect(() => {
		const channelsThree = supabase
			.channel("delete-message")
			.on(
				"postgres_changes",
				{
					event: "DELETE",
					schema: "public",
					table: "posts",
				},
				async (payload) => {
					try {
						const deletedIndex = posts.findIndex(
							(post) => post.id === payload.old.id
						);

						if (deletedIndex > -1) {
							const updatedPosts = [
								...posts.slice(0, deletedIndex),
								...posts.slice(deletedIndex + 1),
							];
							setPosts(updatedPosts);

							if (currentPost === deletedIndex) {
								setCurrentPost((prevPost) =>
									Math.min(prevPost + 1, updatedPosts.length - 1)
								);
							}
						}
					} catch (error) {
						console.error("Error deleting post:", error);
					}
				}
			)
			.subscribe();

		return () => {
			supabase.removeChannel(channelsThree);
		};
	}, [supabase, posts, currentPost]);

	useEffect(() => {
		const interval = setInterval(() => {
			if (posts.length > 0) {
				setCurrentPost((prevPost) => (prevPost + 1) % posts.length);
			}
		}, delay);

		return () => clearInterval(interval);
	}, [delay, posts]);

	return (
		<div className={style.slideshow}>
			<button style={{ display: "none" }} onClick={() => console.log(posts)}>
				Posts
			</button>
			{posts.length > 0 ? (
				<div className={style.slideshow_inner}>
					<div className={style.animatep}>
						<AnimatePresence initial={{ opacity: 0 }}>
							<motion.div
								variants={variants}
								initial="enter"
								animate="center"
								exit="exit"
								className={style.innerdiv}
								transition={{
									x: { type: "spring", stiffness: 300, damping: 30 },
									opacity: { duration: 0.3 },
								}}
							>
								<Image
									loading="eager"
									key={currentPost}
									src={posts[currentPost].image_name}
									width={800}
									alt="Fotka"
									height={800}
									fetchPriority="high"
								/>
								{posts[currentPost].message && (
									<span>{posts[currentPost].message}</span>
								)}
								{posts[currentPost].name && <h1>{posts[currentPost].name}</h1>}
							</motion.div>
						</AnimatePresence>
					</div>
				</div>
			) : (
				<h1>Zatím se zde nenachází žádné vzkazy</h1>
			)}
		</div>
	);
}
