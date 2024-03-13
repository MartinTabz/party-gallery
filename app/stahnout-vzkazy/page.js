import { cookies } from "next/headers";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import MessageDownload from "@components/messagedownload";
import jwt from "jsonwebtoken";
import Unauthorised from "@components/unauthorised";
import style from "@styles/download.module.css";

export const dynamic = "force-dynamic";

export async function generateMetadata() {
	const cookieStore = cookies();
	const heslo = cookieStore.get("allphpass");

	if (!heslo) {
		return {
			title: "Tady nic není!",
		};
	}

	let decoded;

	try {
		decoded = await jwt.verify(heslo.value, process.env.JWT_HESLO);
	} catch (error) {
		throw new Error("Něco se pokazilo při dekodovaní hesla");
	}

	if (!decoded?.pass || decoded.pass != process.env.VSECHNY_FOTKY_HESLO) {
		return {
			title: "Tady nic není!",
		};
	}

	return {
		title: "Stáhnout vzkazy",
	};
}

export default async function StahnoutVzkazyPage() {
	const supabase = createServerComponentClient({ cookies });

	const {
		data: { user },
	} = await supabase.auth.getUser();

	if (user) {
		const { data: messages, error } = await supabase.from("posts").select("*");
		if (error) {
			throw new Error("Něco se pokazilo při načítání vzkazů");
		}

		return (
			<main className={style.section}>
				<div className={style.area}>
					<h1>Stáhnout vzkazy</h1>
					<div className={style.grid}>
						{messages.map((msg) => (
							<MessageDownload msg={msg} />
						))}
					</div>
				</div>
			</main>
		);
	}

	const cookieStore = cookies();
	const heslo = cookieStore.get("allphpass");

	if (!heslo) {
		return <Unauthorised />;
	}

	let decoded;

	try {
		decoded = await jwt.verify(heslo.value, process.env.JWT_HESLO);
	} catch (error) {
		throw new Error("Něco se pokazilo při dekodovaní hesla");
	}

	if (!decoded?.pass || decoded.pass != process.env.VSECHNY_FOTKY_HESLO) {
		return <Unauthorised />;
	}

	const { data: messages, error } = await supabase.from("posts").select("*");
	if (error) {
		throw new Error("Něco se pokazilo při načítání vzkazů");
	}

	return (
		<main className={style.section}>
			<div className={style.area}>
				<h1>Stáhnout vzkazy</h1>
				<div className={style.grid}>
					{messages.map((msg) => (
						<MessageDownload msg={msg} />
					))}
				</div>
			</div>
		</main>
	);
}
