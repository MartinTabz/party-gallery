"use client";

import { useState } from "react";
import Image from "next/image";
import Compressor from "compressorjs";
import { v4 as uuidv4 } from "uuid";
import { useRouter } from "next/navigation";
import { FiLoader } from "react-icons/fi";
import { HiCursorClick } from "react-icons/hi";
import style from "@styles/adminsettings.module.css";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { IoMdCloseCircleOutline } from "react-icons/io";

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

					await supabase.storage
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

					await supabase.storage.from("settings").upload(filePath, mainPageImageFile);
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
		setError((uploadError) => [...uploadError, "Nastavení bylo uloženo"]);
		return router.refresh();
	};

	const onChangeUploadFile = async (event, tag) => {
		try {
			if (!event.target.files || event.target.files.length === 0) {
				setError((uploadError) => [...uploadError, "Nebyl vybrán obrázek"]);
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

	const closeError = (indexToRemove) => {
		const updatedErrors = uploadError.filter(
			(_, index) => index !== indexToRemove
		);
		setError(updatedErrors);
	};

	return (
		<div>
			<section className={style.error_area}>
				{uploadError.length > 0 && (
					<div className={style.error_section}>
						{uploadError.map((e, index) => (
							<div className={style.error} key={index}>
								<span>{e}</span>
								<button onClick={() => closeError(index)}>
									<IoMdCloseCircleOutline />
								</button>
							</div>
						))}
					</div>
				)}
			</section>
			<section className={style.section}>
				<div className={style.area}>
					<h1>Nastavení aplikace</h1>
					<div className={style.public_page}>
						<h2>Veřejná stránka</h2>
						<div className={style.public_page_area}>
							<div className={style.public_page_bg}>
								<div className={style.public_page_image}>
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
								</div>
								<div className={style.public_page_input}>
									<HiCursorClick /> Změnit obrázek
									<input
										type="file"
										accept="image/*"
										multiple={false}
										onChange={(event) => onChangeUploadFile(event, 1)}
									/>
								</div>
							</div>
							<div className={style.public_page_text}>
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

					<div className={style.main_page}>
						<h2>Úvodní stránka</h2>
						<div className={style.main_page_area}>
							<div className={style.public_page_bg}>
								<div className={style.public_page_image}>
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
								</div>
								<div className={style.public_page_input}>
									<HiCursorClick /> Změnit obrázek
									<input
										type="file"
										accept="image/*"
										multiple={false}
										onChange={(event) => onChangeUploadFile(event, 2)}
									/>
								</div>
							</div>
							<div className={style.main_inputs}>
								<div className={style.main_input_area}>
									<label>Text úvodní stránky</label>
									<textarea
										placeholder="Sem vložte text..."
										value={mainPageText}
										onChange={(e) => setMainPageText(e.target.value)}
									/>
								</div>
								<div className={style.main_input_area}>
									<label>Popis úvodní stránky</label>
									<textarea
										placeholder="Sem vložte text..."
										value={mainPageDesc}
										onChange={(e) => setMainPageDesc(e.target.value)}
									/>
								</div>
							</div>
						</div>
					</div>

					<hr />

					<div className={style.presentation}>
						<h2>Prezentace</h2>
						<div className={style.delay_area}>
							<label>Čas mezi obrázky</label>
							<div className={style.delay_input}>
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
					<div className={style.btn_area}>
						<button disabled={isLoading} onClick={handleSave}>
							{isLoading ? (
								<FiLoader color="var(--clr-white)" className={style.spinner} />
							) : (
								"Uložit"
							)}
						</button>
					</div>
				</div>
			</section>
		</div>
	);
}
