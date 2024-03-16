import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import Image from "next/image";
import style from "@styles/program.module.css";

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
		<section className={style.section}>
			<div className={style.area}>
				<div dangerouslySetInnerHTML={{ __html: publicPageText.value }} />
			</div>
			<div className={style.bg}></div>
			<Image
				className={style.image}
				width={600}
				height={400}
				src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/settings/${publicPageImg.value}`}
				alt="Pozadí"
			/>
		</section>
	);
}
