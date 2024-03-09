import Link from "next/link";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import QRCode from "react-qr-code";
import Unauthorised from "@components/unauthorised";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import Image from "next/image";

export const dynamic = "force-dynamic";

export default async function Home() {
	const supabase = createServerComponentClient({ cookies });
	const cookieStore = cookies();
	const heslo = cookieStore.get("pass");

	if (!heslo) {
		return <Unauthorised />;
	}

	let decoded;

	try {
		decoded = await jwt.verify(heslo.value, process.env.JWT_HESLO);
	} catch (error) {
		throw new Error("Něco se pokazilo při dekodovaní hesla");
	}

	if (!decoded?.pass || decoded.pass != process.env.HESLO) {
		return <Unauthorised />;
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
		<main>
			<h1>{mainPageText.value}</h1>
			<div>
				<QRCode
					size={320}
					style={{ margin: "50px" }}
					value={uploadUrl}
					viewBox={`0 0 320 320`}
				/>
			</div>
			<Image
				src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/settings/${mainPageImg.value}`}
				alt="Obrazek"
				width={500}
				height={350}
			/>
			<p>{mainPageDesc.value}</p>
			<br />
			<Link href={`/prezentace`}>Prezentace</Link>
		</main>
	);
}
