"use client";

import { useEffect, useState } from "react";
import { FiLoader } from "react-icons/fi";
import Image from "next/image";
import axios from "axios";
import { IoMdCloseCircle } from "react-icons/io";
import { IoCopy } from "react-icons/io5";
import style from "@styles/adminmessages.module.css";
import { MdDelete } from "react-icons/md";
import { IoMdCloseCircleOutline } from "react-icons/io";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { FaEye } from "react-icons/fa";

export default function MessageManage({ posts: rawPosts, emailPassword }) {
	const supabase = createClientComponentClient();
	const [posts, setPosts] = useState(rawPosts);
	const [reviewedPost, setReviewedPost] = useState("");

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

	const copyTextToClipboard = (text) => {
		navigator.clipboard
			.writeText(text)
			.then(() => {
				setPopupMessage("Odkaz zkopírován");
			})
			.catch((error) => {
				console.log(error);
				setPopupMessage("Odkaz se podařilo zkopírovat");
			});
	};

	return (
		<>
			{reviewedPost && (
				<section className={style.review_section}>
					<button onClick={() => setReviewedPost("")}>
						<IoMdCloseCircle />
					</button>
					<div className={style.review_area}>
						<Image src={reviewedPost} height={1000} width={1000} />
					</div>
				</section>
			)}
			{popupMessage && (
				<section className={style.popup_section}>
					<div className={style.popup}>
						<span>{popupMessage}</span>
						<button onClick={() => setPopupMessage("")}>
							<IoMdCloseCircleOutline />
						</button>
					</div>
				</section>
			)}
			{selectedPostId && (
				<div className={style.delete_conf}>
					<div className={style.delete_inner}>
						<h2>
							Jste si jisti, že chcete
							<br />
							odebrat tento vzkaz?
						</h2>
						<div className={style.delete_btns}>
							<button disabled={isLoading} onClick={() => deletePost()}>
								{isLoading ? (
									<FiLoader
										color="var(--clr-white)"
										className={style.spinner}
									/>
								) : (
									"Potvrdit"
								)}
							</button>
							<button
								disabled={isLoading}
								onClick={() => setSelectedPostId("")}
							>
								Zrušit
							</button>
						</div>
					</div>
				</div>
			)}
			<section className={style.section}>
				<div className={style.area}>
					<div className={style.email_link_area}>
						<div className={style.email_link_text}>
							<h3>Přístup na stránku ke stažení</h3>
							<p>
								Stránka, kde se stahují všechny fotky je zabezpečená. Tento
								odkaz zkopírujte a pošlete emailem. Uživatele aplikace po
								prokliknutí odkáže na stránku
							</p>
						</div>
						<div className={style.email_link}>
							<span>{`${process.env.NEXT_PUBLIC_DOMAIN}/api/self-auth-allphotos?h=${emailPassword}`}</span>
							<button
								onClick={() =>
									copyTextToClipboard(
										`${process.env.NEXT_PUBLIC_DOMAIN}/api/self-auth-allphotos?h=${emailPassword}`
									)
								}
							>
								<IoCopy />
							</button>
						</div>
					</div>
					<section className={style.posts_area}>
						<h2>Správa vzkazů</h2>
						<div className={style.stats}>
							<span>
								Počet vzkazů: <b>{posts.length}</b>
							</span>
							<span>
								Místo využito:{" "}
								<b>{Number((sumContentLength(posts) / 1000000).toFixed(2))}/1024 MB</b>
							</span>
						</div>
						<div className={style.posts}>
							{posts.map((post) => (
								<div className={style.post} key={post.id}>
									<div className={style.post_text_area}>
										<div className={style.post_img_area}>
											<button
												onClick={() =>
													setReviewedPost(
														`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/photos/${post.image_name}`
													)
												}
											>
												<FaEye />
											</button>
											<Image
												src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/photos/${post.image_name}`}
												alt="Fotka u vzkazu"
												width={200}
												height={200}
											/>
										</div>
										<div className={style.details}>
											<div className={style.details_top}>
												<span>
													<b>ID:</b> {post.id}
												</span>
												<span>
													<b>Vytvořeno:</b> {formatDate(post.created_at)}
												</span>
												<span>
													<b>Velikost:</b>{" "}
													{Number((post.contentLength / 1000000).toFixed(2))} MB
												</span>
											</div>
											<div className={style.details_bottom}>
												<h2>
													<b>Jméno:</b> {post.name}
												</h2>
												<p>
													<b>Vzkaz:</b> {post.message}
												</p>
											</div>
										</div>
									</div>
									<div className={style.post_delete}>
										<button
											disabled={selectedPostId ? true : false}
											onClick={() => {
												setSelectedPostId(post.id);
												setPopupMessage("");
											}}
										>
											<MdDelete />
										</button>
									</div>
								</div>
							))}
						</div>
					</section>
				</div>
			</section>
		</>
	);
}

function formatDate(timestampz) {
	const date = new Date(timestampz);
	const options = {
		day: "numeric",
		month: "short",
		year: "numeric",
		hour: "numeric",
		minute: "numeric",
		hour12: false,
		timeZone: "Europe/Prague",
	};
	const formattedDate = date.toLocaleString("cs-CZ", options);

	return formattedDate;
}

function sumContentLength(posts) {
	let sum = 0;
	for (const post of posts) {
		if (post.contentLength) {
			sum += post.contentLength;
		}
	}
	return sum;
}
