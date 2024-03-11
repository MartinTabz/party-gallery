"use client";

import Image from "next/image";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useEffect, useState } from "react";
import Link from "next/link";
import style from "@styles/download.module.css";
import { FaCloudDownloadAlt } from "react-icons/fa";

export default function MessageDownload({ msg }) {
	const supabase = createClientComponentClient();
	const [donwloadLink, setDownloadLink] = useState();

	useEffect(() => {
		const getLink = async () => {
			const { data } = await supabase.storage
				.from("photos")
				.getPublicUrl(msg.image_name, { download: true });

			setDownloadLink(data.publicUrl);
		};

		getLink();
	}, [supabase]);

	return (
		<div className={style.card} key={msg.id}>
			<div className={style.content}>
				<div className={style.image}>
					<Image
						src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/photos/${msg.image_name}`}
						alt="Fotka u vzkazu"
						width={300}
						height={200}
					/>
				</div>
				<div className={style.text}>
					<h2>{msg.name}</h2>
					<p>{msg.message}</p>
				</div>
			</div>
			{donwloadLink && <Link href={donwloadLink}><FaCloudDownloadAlt /></Link>}
		</div>
	);
}
