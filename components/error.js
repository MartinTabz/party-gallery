"use client";

import Link from "next/link";

export default function ErrorComponent({ reload, error }) {
	console.log(error.message);
	return (
		<main>
			<h1>Něco se pokazilo</h1>
			<div>
				<Link href={"/"}>Domů</Link>
				<button onClick={reload}>Zkusit znovu</button>
			</div>
		</main>
	);
}
