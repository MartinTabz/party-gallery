"use client";

import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useState } from "react";
import { useRouter } from "next/navigation";

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
		<div>
			<h1>Přihlášení do administrace</h1>
			<div>
				<input
					type="email"
					value={email}
               placeholder="E-Mail"
               id="email"
               name="email"
					onChange={(e) => setEmail(e.target.value)}
				/>
			</div>
			<div>
				<input
					type="password"
					value={password}
               placeholder="Heslo"
					onChange={(e) => setPassword(e.target.value)}
				/>
			</div>
			<div>
				{isLoading ? (
					<span>Načítání</span>
				) : (
					<button onClick={handleSubmit}>Přihlásit se</button>
				)}
			</div>
		</div>
	);
}
