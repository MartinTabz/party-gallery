"use client";

import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useState } from "react";
import style from "@styles/login.module.css";
import { useRouter } from "next/navigation";
import { FiLoader } from "react-icons/fi";

export default function AdminLoginForm() {
	const supabase = createClientComponentClient();
	const router = useRouter();

	const [isLoading, setIsLoading] = useState(false);
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");

	const handleSubmit = async (e) => {
		e.preventDefault();
		setIsLoading(true);

		await supabase.auth.signInWithPassword({
			email,
			password,
		});

		router.refresh();
	};

	return (
		<main className={style.main_section}>
			<div className={style.main_area}>
				<h1>Přihlášení do administrace</h1>
				<input
					type="email"
					value={email}
					placeholder="E-Mail"
					className={style.input}
					disabled={isLoading}
					id="email"
					name="email"
					onChange={(e) => setEmail(e.target.value)}
				/>
				<input
					type="password"
					value={password}
					className={style.input}
					disabled={isLoading}
					placeholder="Heslo"
					onChange={(e) => setPassword(e.target.value)}
				/>

				<div className={style.btn}>
					{isLoading ? (
						<span>
							<FiLoader color="var(--clr-white)" className={style.spinner} />
						</span>
					) : (
						<button onClick={handleSubmit}>Přihlásit se</button>
					)}
				</div>
			</div>
		</main>
	);
}
