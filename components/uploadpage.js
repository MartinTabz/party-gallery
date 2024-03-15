"use client";

import { useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import Image from "next/image";
import crypto from "crypto";
import style from "@styles/message.module.css";
import { FiLoader } from "react-icons/fi";
import { GiClick } from "react-icons/gi";

export default function UploadComponent() {
	const supabase = createClientComponentClient();

	const [isLoading, setIsLoading] = useState(false);
	const [uploadingError, setUploadingError] = useState("");
	const [success, setSuccess] = useState(false);

	const [name, setName] = useState("");
	const [message, setMessage] = useState("");
	const [imageFile, setImageFile] = useState();
	const [imageSrc, setImageSrc] = useState();

	const handleSubmit = async (e) => {
		e.preventDefault();

		if (!imageFile) {
			setUploadingError("Chybí obrázek");
			return;
		}

		setIsLoading(true);

		const fileExt = imageFile.name.split(".").pop();
		const filePath = `${uuidv4()}-${crypto
			.randomBytes(16)
			.toString("hex")}.${fileExt}`;

		await supabase.storage.from("photos").upload(filePath, imageFile);

		const { error } = await supabase.from("posts").insert({
			name: name || null,
			message: message || null,
			image_name: filePath,
		});

		if (error) {
			setUploadingError(error.message);
		} else {
			setSuccess(true);
		}
	};

	const onChangeUploadFile = async (event) => {
		try {
			if (!event.target.files || event.target.files.length === 0) {
				console.log("You must select an image to upload.");
				return;
			}

			const file = event.target.files[0];

			if (file.size > 6000000) {
				setUploadingError("Obrázek je příliš velký");
				return;
			}

			setImageFile(file);

			setImageSrc(URL.createObjectURL(file));
		} catch (error) {
			setUploadingError(error.message);
		}
	};

	const handleRestart = () => {
		setUploadingError("");

		setName("");
		setMessage("");
		setImageFile();
		setImageSrc();

		setIsLoading(false);
		setSuccess(false);
	};

	return (
		<main className={style.main_section}>
			<div className={style.area}>
				{success ? (
					<div className={style.success}>
						<h2>Hotovo, vzkaz byl odeslán!</h2>
						<button onClick={handleRestart}>Nahrát další</button>
					</div>
				) : (
					<div className={style.input_form}>
						<div className={style.input_area}>
							<h1>Nahrát vzkaz</h1>
							<div className={style.input_inner}>
								<div>
									<label htmlFor="name">Jméno (nepovinné)</label>
									<span>{name.length}/15</span>
								</div>
								<input
									id="name"
									name="name"
									disabled={isLoading}
									value={name}
									onChange={(e) => {
										if (e.target.value.length <= 15) {
											setName(e.target.value);
										}
									}}
								/>
							</div>
							<div className={style.textarea_inner}>
								<textarea
									value={message}
									disabled={isLoading}
									onChange={(e) => {
										if (e.target.value.length <= 100) {
											setMessage(e.target.value);
										}
									}}
									placeholder="Vzkaz"
								/>
								<span>{message.length}/100</span>
							</div>
							{imageSrc && (
								<Image
									className={style.inputed_img}
									width={400}
									height={200}
									src={imageSrc}
									alt="Obrázek"
								/>
							)}
							<div className={style.file_input}>
								<GiClick />
								Klikni a nahraj obrázek
								<input
									type="file"
									disabled={isLoading}
									accept="image/*"
									multiple={false}
									onChange={onChangeUploadFile}
								/>
							</div>
						</div>
						<div className={style.btn}>
							{isLoading ? (
								<span>
									<FiLoader
										color="var(--clr-white)"
										className={style.spinner}
									/>
								</span>
							) : (
								<button onClick={handleSubmit}>Odeslat</button>
							)}
						</div>
						{uploadingError && <span>{uploadingError}</span>}
					</div>
				)}
			</div>
		</main>
	);
}
