import Link from "next/link";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import QRCode from "react-qr-code";
import Unauthorised from "@components/unauthorised";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import Image from "next/image";
import style from "@styles/home.module.css";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function Home() {
	const supabase = createServerComponentClient({ cookies });

	const {
		data: { user },
	} = await supabase.auth.getUser();

	if (!user) {
		<Unauthorised />;
	}

	const uploadUrl = `${process.env.NEXT_PUBLIC_DOMAIN}/api/self-auth-callback?h=${process.env.HESLO}`;

	const { data, error } = await supabase.from("settings").select("*");

	if (error) {
		throw new Error("Něco se pokazilo");
	}

	const mainPageText = data.find((record) => record.name === "main_page_text");
	const mainPageImg = data.find((record) => record.name === "main_page_img");
	const mainPageDesc = data.find(
		(record) => record.name === "main_page_description"
	);

	return (
		<main className={style.main_section}>
			<div className={style.area}>
				<h1>{mainPageText.value}</h1>

				<div className={style.qr}>
					<QRCode size={280} value={uploadUrl} viewBox={`0 0 280 280`} />
				</div>

				<p>{mainPageDesc.value}</p>
				<Link href={`/prezentace`}>Prezentace</Link>
			</div>
			<div className={style.background}>
				<div></div>
				<Image
					src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/settings/${mainPageImg.value}`}
					alt="Obrázek v pozadí"
					width={1920}
					height={1080}
				/>
			</div>
		</main>
	);
}
