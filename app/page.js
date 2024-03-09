import Link from "next/link";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

export const dynamic = "force-dynamic";

export default async function Home({ searchParams }) {
	const cookieStore = cookies();
	const heslo = cookieStore.get("pass");

	if (!heslo) {
		return (
			<main>
				<h1>Něco se pokazilo</h1>
				<span>Error 404</span>
			</main>
		);
	}

	let decoded;

	try {
		decoded = await jwt.verify(heslo.value, process.env.JWT_HESLO);
	} catch (error) {
		throw new Error("Něco se pokazilo při dekodovaní hesla")
	}

	if (!decoded?.pass || decoded.pass != process.env.HESLO) {
		return (
			<main>
				<h1>Něco se pokazilo</h1>
				<span>Error 404</span>
			</main>
		);
	}

	return (
		<main>
			<h1>Party Gallery</h1>
			<h2>{searchParams.h}</h2>
			<p>
				Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Mauris dictum
				facilisis augue. Aenean placerat. Sed vel lectus. Donec odio tempus
				molestie, porttitor ut, iaculis quis, sem. In rutrum. Nunc auctor. Class
				aptent taciti sociosqu ad litora torquent per conubia nostra, per
				inceptos hymenaeos. In dapibus augue non sapien. Nulla est. Aliquam erat
				volutpat. Lorem ipsum dolor sit amet, consectetuer adipiscing elit.
				Nulla est. Nulla quis diam. Duis sapien nunc, commodo et, interdum
				suscipit, sollicitudin et, dolor. Aenean id metus id velit ullamcorper
				pulvinar. Mauris dictum facilisis augue. Et harum quidem rerum facilis
				est et expedita distinctio. Pellentesque sapien.
			</p>
			<br />
			<Link href={`/nahrat`}>Nahrát vzkaz</Link>
		</main>
	);
}
