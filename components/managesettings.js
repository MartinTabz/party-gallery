"use client";

import { useState } from "react";
import Image from "next/image";
import Compressor from "compressorjs";
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

	const [publicPageImageFile, setPublicPageImageFile] = useState();
	const [publicPageImageSrc, setPublicPageImageSrc] = useState();

	const [mainPageImageFile, setMainPageImageFile] = useState();
	const [mainPageImageSrc, setMainPageImageSrc] = useState();

	const handleSave = async (e) => {
		e.preventDefault();
		setIsLoading(true);

		try {
			if (publicPageImageFile) {
				const { error: file_delete_error } = await supabase.storage
					.from("settings")
					.remove(settings[1].value);

				if (file_delete_error) {
					setError((uploadError) => [
						...uploadError,
						file_delete_error.message,
					]);
				} else {
					const fileExt = publicPageImageFile.name.split(".").pop();
					const filePath = `${uuidv4()}.${fileExt}`;

					const { error } = await supabase
						.from("settings")
						.update({ value: filePath })
						.eq("name", settings[1].name)
						.select()
						.single();

					if (error) {
						setError((uploadError) => [
							...uploadError,
							"Něco se pokazilo při zapisování nového obrázku do tabulky",
						]);
					}

					supabase.storage
						.from("settings")
						.upload(filePath, publicPageImageFile);
				}
			}

			if (mainPageImageFile) {
				const { error: file_delete_error } = await supabase.storage
					.from("settings")
					.remove(settings[3].value);

				if (file_delete_error) {
					setError((uploadError) => [
						...uploadError,
						file_delete_error.message,
					]);
				} else {
					const fileExt = mainPageImageFile.name.split(".").pop();
					const filePath = `${uuidv4()}.${fileExt}`;

					const { error } = await supabase
						.from("settings")
						.update({ value: filePath })
						.eq("name", settings[3].name)
						.select()
						.single();

					if (error) {
						setError((uploadError) => [
							...uploadError,
							"Něco se pokazilo při zapisování nového obrázku do tabulky",
						]);
					}

					supabase.storage
						.from("settings")
						.upload(filePath, mainPageImageFile);
				}
			}

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
		} catch (error) {
			setError((uploadError) => [...uploadError, error.message]);
		}

		setIsLoading(false);
		return router.refresh();
	};

	const onChangeUploadFile = async (event, tag) => {
		try {
			if (!event.target.files || event.target.files.length === 0) {
				console.log("You must select an image to upload.");
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

			new Compressor(file, {
				quality: 0.6,
				success: (res) => {
					if (tag == 1) {
						setPublicPageImageFile(res);
					} else {
						setMainPageImageFile(res);
					}
				},
			});

			if (tag == 1) {
				setPublicPageImageSrc(URL.createObjectURL(file));
			} else {
				setMainPageImageSrc(URL.createObjectURL(file));
			}
		} catch (error) {
			setError((uploadError) => [...uploadError, error.message]);
		}
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
						src={
							publicPageImageSrc
								? publicPageImageSrc
								: `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/settings/${publicPageImg}`
						}
						alt="Obrazek nastaveni"
						width={300}
						height={200}
					/>
					<input
						type="file"
						accept="image/*"
						multiple={false}
						onChange={(event) => onChangeUploadFile(event, 1)}
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
						src={
							mainPageImageSrc
								? mainPageImageSrc
								: `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/settings/${mainPageImg}`
						}
						alt="Obrazek nastaveni"
						width={300}
						height={200}
					/>
					<input
						type="file"
						accept="image/*"
						multiple={false}
						onChange={(event) => onChangeUploadFile(event, 2)}
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
