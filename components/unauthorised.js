import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import Image from "next/image";
import style from "@styles/unauthorised.module.css";

export default async function Unauthorised() {
	const supabase = createServerComponentClient({ cookies });
	const { data, error } = await supabase.from("settings").select("*");

	if (error) {
		throw new Error("Něco se pokazilo");
	}

	const publicPageText = data.find(
		(record) => record.name === "public_page_text"
	);
	const publicPageImg = data.find(
		(record) => record.name === "public_page_img"
	);

	return (
		<main className={style.main_area}>
			<div className={style.text_area}>
				<h1>{publicPageText.value}</h1>
			</div>
			<div className={style.img_area}>
				<Image
					src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/settings/${publicPageImg.value}`}
					alt="Obrazek"
					width={500}
					height={350}
				/>
			</div>
		</main>
	);
}
