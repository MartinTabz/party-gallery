"use client";

import { useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import Image from "next/image";
import crypto from "crypto";
import Compressor from "compressorjs";

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

		let path;

		do {
			const fileExt = imageFile.name.split(".").pop();
			const filePath = `${uuidv4()}-${crypto
				.randomBytes(16)
				.toString("hex")}.${fileExt}`;

			const { data: upload_data, error: upload_error } = await supabase.storage
				.from("photos")
				.upload(filePath, imageFile);

			if (upload_error && !upload_error.error === "Duplicate") {
				setUploadingError(upload_error.message);
			}

			if (upload_data.path) {
				path = upload_data.path;
			}
		} while (!path);

		const { error } = await supabase.from("posts").insert({
			name: name || null,
			message: message || null,
			image_name: path,
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
			console.log(file);

			if (file.size > 5000000) {
				setUploadingError("Obrázek je příliš velký");
				return;
			}

			new Compressor(file, {
				quality: 0.6, // 0.6 can also be used, but its not recommended to go below.
				success: (res) => {
					console.log(res)
					setImageFile(res);
				},
			});
			
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

	const showFile = () => {
		console.log(imageFile);
	}

	return (
		<main>
			{success ? (
				<main>
					<h1>Hotovo, vzkaz byl odeslán!</h1>
					<button onClick={handleRestart}>Nahrát další</button>
				</main>
			) : (
				<>
					<h1>Poslat vzkaz</h1>
					<div>
						<div>
							<label htmlFor="name">Jméno (nepovinné)</label>
							<span>{name.length}/15</span>
						</div>
						<input
							id="name"
							name="name"
							value={name}
							onChange={(e) => {
								if (e.target.value.length <= 15) {
									setName(e.target.value);
								}
							}}
						/>
					</div>
					<div>
						<span>{message.length}/100</span>
						<textarea
							value={message}
							onChange={(e) => {
								if (e.target.value.length <= 100) {
									setMessage(e.target.value);
								}
							}}
							placeholder="Vzkaz"
						/>
					</div>
					{imageSrc && (
						<Image width={300} height={200} src={imageSrc} alt="Obrázek" />
					)}
					<input
						type="file"
						accept="image/*"
						multiple={false}
						onChange={onChangeUploadFile}
					/>
					<div>
						{isLoading ? (
							<span>Odesílá se...</span>
						) : (
							<button onClick={handleSubmit}>Odeslat</button>
						)}
					</div>
					{uploadingError && <span>{uploadingError}</span>}
					<button onClick={showFile}>Ukazat soubor</button>
				</>
			)}
		</main>
	);
}
