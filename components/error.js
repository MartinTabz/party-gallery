"use client";

import Link from "next/link";
import style from "@styles/error.module.css";

export default function ErrorComponent({ reload, error }) {
	console.log(error.message);
	return (
		<main className={style.section}>
			<div className={style.area}>
				<h1>Něco se pokazilo</h1>
				<div className={style.btns}>
					<Link href={"/"}>Domů</Link>
					<button onClick={reload}>Zkusit znovu</button>
				</div>
			</div>
		</main>
	);
}
