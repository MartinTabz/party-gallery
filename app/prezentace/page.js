import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import ShowCase from "@components/showcase";
import QRCode from "react-qr-code";
import Unauthorised from "@components/unauthorised";
import style from "@styles/presentation.module.css";

export const dynamic = "force-dynamic";

export async function generateMetadata() {
	const supabase = createServerComponentClient({ cookies });

	const {
		data: { user },
	} = await supabase.auth.getUser();

	if (user) {
		return {
			title: "Prezentace vzkazů",
		};
	}

	const cookieStore = cookies();
	const heslo = cookieStore.get("pass");

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

	if (!decoded?.pass || decoded.pass != process.env.HESLO) {
		return {
			title: "Tady nic není!",
		};
	}

	return {
		title: "Prezentace",
	};
}

export default async function Loading() {
	const cookieStore = cookies();
	const heslo = cookieStore.get("pass");
	const supabase = createServerComponentClient({ cookies });

	const {
		data: { user },
	} = await supabase.auth.getUser();

	if (user) {
		const { data: posts, error } = await supabase
			.from("posts")
			.select("*")
			.order("created_at", { ascending: true });

		if (error) {
			throw new Error(error.message);
		}

		const modifiedPosts = posts.map((post) => {
			return {
				...post,
				image_name: `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/photos/${post.image_name}`,
			};
		});

		console.log(modifiedPosts);

		const { data: delay, error: settings_error } = await supabase
			.from("settings")
			.select("value")
			.eq("name", "presentation_delay")
			.single();

		if (settings_error) {
			throw new Error(error.message);
		}

		const uploadUrl = `${process.env.NEXT_PUBLIC_DOMAIN}/api/self-auth-callback?h=${process.env.HESLO}`;

		return (
			<main className={style.main}>
				<div className={style.qr}>
					<QRCode size={220} value={uploadUrl} viewBox={`0 0 220 220`} />
				</div>
				<ShowCase delay={delay.value} posts={modifiedPosts} />
			</main>
		);
	}

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

	const { data: posts, error } = await supabase
		.from("posts")
		.select("*")
		.order("created_at", { ascending: true });

	if (error) {
		throw new Error(error.message);
	}

	const modifiedPosts = posts.map((post) => {
		return {
			...post,
			image_name: `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/photos/${post.image_name}`,
		};
	});

	const { data: delay, error: settings_error } = await supabase
		.from("settings")
		.select("value")
		.eq("name", "presentation_delay")
		.single();

	if (settings_error) {
		throw new Error(error.message);
	}

	const uploadUrl = `${process.env.NEXT_PUBLIC_DOMAIN}/api/self-auth-callback?h=${process.env.HESLO}`;

	return (
		<main className={style.main}>
			<div className={style.qr}>
				<QRCode size={300} value={uploadUrl} viewBox={`0 0 300 300`} />
			</div>
			<ShowCase delay={delay.value} posts={modifiedPosts} />
		</main>
	);
}
