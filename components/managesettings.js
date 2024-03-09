"use client";

import { useState } from "react";
import Image from "next/image";
import crypto from "crypto";
import { v4 as uuidv4 } from "uuid";
import { useRouter } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

export default function ManageSettings({ settings }) {
	const supabase = createClientComponentClient();
	const router = useRouter();

	const [isLoading, setIsLoading] = useState(false);
	const [uploadError, setError] = useState([]);

	const [mainPageDesc, setMainPageDesc] = useState(settings[0].value);
	const [publicPageImg, setPublicPageImg] = useState(settings[1].value);
	const [publicPageText, setPublicPageText] = useState(settings[2].value);
	const [mainPageImg, setMainPageImg] = useState(settings[3].value);
	const [mainPageText, setMainPageText] = useState(settings[4].value);
	const [presentationDelay, setPresentationDelay] = useState(settings[5].value);

	const changeImage = async (event, tag) => {
		setIsLoading(true);

		try {
			if (!event.target.files || event.target.files.length === 0) {
				setError((uploadError) => [
					...uploadError,
					"Musíte vybrat obrázek k nahrání",
				]);
				return;
			}

			const file = event.target.files[0];

			if (file.size > 2000000) {
				setError((uploadError) => [
					...uploadError,
					"Obrázek je příliš velký (Max 2MB)",
				]);
				return;
			}

			const { error: file_delete_error } = await supabase.storage
				.from("settings")
				.remove(settings[tag].value);

			if (file_delete_error) {
				setError((uploadError) => [
					...uploadError,
					"Něco se pokazilo při mazání starého obrázku",
				]);
				return;
			}

			let path;

			do {
				const fileExt = file.name.split(".").pop();
				const filePath = `${uuidv4()}-${crypto
					.randomBytes(16)
					.toString("hex")}.${fileExt}`;

				const { data: upload_data, error: upload_error } =
					await supabase.storage.from("settings").upload(filePath, file);

				if (upload_error && !upload_error.error === "Duplicate") {
					setError((uploadError) => [...uploadError, upload_error.message]);
					return;
				}

				if (upload_data.path) {
					path = upload_data.path;
				}

				if (tag == 1) {
					setPublicPageImg(filePath);
				} else if (tag == 3) {
					setMainPageImg(filePath);
				}
			} while (!path);

			const { error } = await supabase
				.from("settings")
				.update({ value: path })
				.eq("name", settings[tag].name)
				.select();

			if (error) {
				setError((uploadError) => [...uploadError, error.message]);
			}
		} catch (error) {
			setError((uploadError) => [...uploadError, error.message]);
		}

		setIsLoading(false);
	};

	const handleSave = async (e) => {
		e.preventDefault();

		if (mainPageDesc != settings[0].value) {
			const { error } = await supabase
				.from("settings")
				.update({ value: mainPageDesc })
				.eq("name", settings[0].name)
				.select();

			if (error) {
				setError((uploadError) => [
					...uploadError,
					"Něco se pokazilo při náhrávání popisku na hlavní stránce",
				]);
			}
		}

		if (publicPageText != settings[2].value) {
			const { error } = await supabase
				.from("settings")
				.update({ value: publicPageText })
				.eq("name", settings[2].name)
				.select();

			if (error) {
				setError((uploadError) => [
					...uploadError,
					"Něco se pokazilo při nahrávání veřejného textu",
				]);
			}
		}

		if (mainPageText != settings[4].value) {
			const { error } = await supabase
				.from("settings")
				.update({ value: mainPageText })
				.eq("name", settings[4].name)
				.select();

			if (error) {
				setError((uploadError) => [
					...uploadError,
					"Něco se pokazilo při nahrávání textu na hlavní stránce",
				]);
			}
		}

		if (presentationDelay != settings[5].value) {
			const { error } = await supabase
				.from("settings")
				.update({ value: presentationDelay })
				.eq("name", settings[5].name)
				.select();

			if (error) {
				setError((uploadError) => [
					...uploadError,
					"Něco se pokazilo při nahrávání textu na hlavní stránce",
				]);
			}
		}

		setIsLoading(false);
	};

	return (
		<div>
			{uploadError.length > 0 && (
				<div>
					{uploadError.map((e, index) => (
						<div key={index}>
							<span>{e}</span>
							<button>X</button>
						</div>
					))}
				</div>
			)}
			<div>
				<h2>Veřejná stránka</h2>
				<div>
					<Image
						src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/settings/${publicPageImg}`}
						alt="Obrazek nastaveni"
						width={300}
						height={200}
					/>
					<input
						type="file"
						accept="image/*"
						multiple={false}
						onChange={(event) => changeImage(event, 1)}
					/>
				</div>
				<div>
					<div>
						<label>Text veřejné stránky</label>
						<textarea
							placeholder="Sem vložte text..."
							value={publicPageText}
							onChange={(e) => setPublicPageText(e.target.value)}
						/>
					</div>
				</div>
			</div>
			<hr />
			<div>
				<h2>Úvodní stránka</h2>
				<div>
					<Image
						src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/settings/${mainPageImg}`}
						alt="Obrazek nastaveni"
						width={300}
						height={200}
					/>
					<input
						type="file"
						accept="image/*"
						multiple={false}
						onChange={(event) => changeImage(event, 3)}
					/>
				</div>
				<div>
					<div>
						<label>Text úvodní stránky</label>
						<textarea
							placeholder="Sem vložte text..."
							value={mainPageText}
							onChange={(e) => setMainPageText(e.target.value)}
						/>
					</div>
					<div>
						<label>Popis úvodní stránky</label>
						<textarea
							placeholder="Sem vložte text..."
							value={mainPageDesc}
							onChange={(e) => setMainPageDesc(e.target.value)}
						/>
					</div>
				</div>
			</div>
			<hr />
			<div>
				<div>
					<label>Čas mezi obrázky</label>
					<div>
						<input
							type="number"
							min={500}
							required
							placeholder="Min 500"
							value={presentationDelay}
							onChange={(e) => setPresentationDelay(e.target.value)}
						/>
						milisekund
					</div>
				</div>
			</div>
			<div>
				{isLoading ? (
					<span>Ukládá se</span>
				) : (
					<button onClick={handleSave}>Uložit</button>
				)}
			</div>
		</div>
	);
}
