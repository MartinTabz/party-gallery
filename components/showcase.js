"use client";

import { useState, useEffect, useRef } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { AnimatePresence, motion } from "framer-motion";
import style from "@styles/presentation.module.css";

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

const swipeConfidenceThreshold = 10000;
const swipePower = (offset, velocity) => {
	return Math.abs(offset) * velocity;
};

export default function ShowCase({ posts: rawPosts, delay: delayString }) {
	const supabase = createClientComponentClient();

	const [posts, setPosts] = useState(rawPosts);
	const [delay, setDelay] = useState(5000);
	const [currentPost, setCurrentPost] = useState(0);

	const [[page, direction], setPage] = useState([0, 0]);

	const paginate = (newDirection) => {
		setPage([page + newDirection, newDirection]);
	};

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
		<div className={style.slideshow}>
			<div className={style.slideshow_inner}>
				<div className={style.animatep}>
					<AnimatePresence initial={{ opacity: 0 }} custom={direction}>
						<motion.h1
							key={currentPost}
							custom={direction}
							variants={variants}
							initial="enter"
							animate="center"
							exit="exit"
							transition={{
								x: { type: "spring", stiffness: 300, damping: 30 },
								opacity: { duration: 0.3 },
							}}
						>
							{posts[currentPost].name && posts[currentPost].name}
						</motion.h1>
					</AnimatePresence>
					<AnimatePresence initial={{ opacity: 0 }} custom={direction}>
						<motion.img
							key={currentPost}
							src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/photos/${posts[currentPost].image_name}`}
							custom={direction}
							variants={variants}
							initial="enter"
							animate="center"
							exit="exit"
							transition={{
								x: { type: "spring", stiffness: 300, damping: 30 },
								opacity: { duration: 0.3 },
							}}
						/>
					</AnimatePresence>
					<AnimatePresence initial={{ opacity: 0 }} custom={direction}>
						<motion.span
							key={currentPost}
							custom={direction}
							variants={variants}
							initial="enter"
							animate="center"
							exit="exit"
							transition={{
								x: { type: "spring", stiffness: 300, damping: 30 },
								opacity: { duration: 0.3 },
							}}
						>
							{posts[currentPost].message && posts[currentPost].message}
						</motion.span>
					</AnimatePresence>
				</div>
			</div>
		</div>
	);
}
