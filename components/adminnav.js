"use client";

import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import Link from "next/link";
import { IoLogOut } from "react-icons/io5";
import { useRouter } from "next/navigation";
import style from "@styles/adminnav.module.css";

export default function AdminNavigation() {
	const router = useRouter();
	const supabase = createClientComponentClient();

	const logOut = async () => {
		await supabase.auth.signOut();
		router.refresh();
	};

	return (
		<header className={style.section}>
			<div className={style.area}>
				<h1>Administrace</h1>
				<nav>
					<Link href={"/"}>Domov</Link>
					<Link href={"/program"}>Program</Link>
					<Link href={"/admin"}>Správa</Link>
					<Link href={"/admin/nastaveni"}>Nastavení</Link>
					<Link href={"/admin/stul"}>Stůl</Link>
				</nav>
				<button onClick={logOut}>
					<IoLogOut />
				</button>
			</div>
		</header>
	);
}
