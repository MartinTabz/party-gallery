"use client";

import { useState } from "react";
import Image from "next/image";
import { v4 as uuidv4 } from "uuid";
import { useRouter } from "next/navigation";
import crypto from "crypto";
import { FiLoader } from "react-icons/fi";
import Document from "@tiptap/extension-document";
import Paragraph from "@tiptap/extension-paragraph";
import Text from "@tiptap/extension-text";
import TextStyle from "@tiptap/extension-text-style";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import ListItem from "@tiptap/extension-list-item";
import { HiCursorClick } from "react-icons/hi";
import style from "@styles/adminsettings.module.css";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { IoMdCloseCircleOutline } from "react-icons/io";
import { Color } from "@tiptap/extension-color";
import { HexColorPicker } from "react-colorful";
import {
	LuHeading1,
	LuPalette,
	LuPilcrow,
	LuHeading2,
	LuItalic,
	LuBold,
	LuListOrdered,
	LuList,
} from "react-icons/lu";

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
	const [programPageImg, setProgramPageImg] = useState(settings[6].value);
	const [programPageText, setProgramPageText] = useState(settings[7].value);

	const [publicPageImageFile, setPublicPageImageFile] = useState();
	const [publicPageImageSrc, setPublicPageImageSrc] = useState();

	const [mainPageImageFile, setMainPageImageFile] = useState();
	const [mainPageImageSrc, setMainPageImageSrc] = useState();

	const [programPageImageFile, setProgramPageImageFile] = useState();
	const [programPageImageSrc, setProgramPageImageSrc] = useState();

	const programPageditor = useEditor({
		extensions: [
			Document,
			Paragraph,
			Text,
			Color.configure({ types: [TextStyle.name, ListItem.name] }),
			TextStyle.configure({ types: [TextStyle.name] }),
			StarterKit.configure({
				bulletList: {
					keepMarks: true,
					keepAttributes: false,
				},
				orderedList: {
					keepMarks: true,
					keepAttributes: false,
				},
			}),
		],
		content: programPageText,
	});

	const publicPageditor = useEditor({
		extensions: [
			Document,
			Paragraph,
			Text,
			Color.configure({ types: [TextStyle.name, ListItem.name] }),
			TextStyle.configure({ types: [TextStyle.name] }),
			StarterKit.configure({
				bulletList: {
					keepMarks: true,
					keepAttributes: false,
				},
				orderedList: {
					keepMarks: true,
					keepAttributes: false,
				},
			}),
		],
		content: publicPageText,
	});

	const mainPageEditor = useEditor({
		extensions: [
			Document,
			Paragraph,
			Text,
			TextStyle.configure({ types: [TextStyle.name] }),
		],
		content: mainPageText,
	});

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
					const filePath = `${uuidv4()}-${crypto
						.randomBytes(16)
						.toString("hex")}.${fileExt}`;

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

					await supabase.storage
						.from("settings")
						.upload(filePath, mainPageImageFile);

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
				}
			}

			if (programPageImageFile) {
				const { error: file_delete_error } = await supabase.storage
					.from("settings")
					.remove(settings[6].value);

				if (file_delete_error) {
					setError((uploadError) => [
						...uploadError,
						file_delete_error.message,
					]);
				} else {
					const fileExt = programPageImageFile.name.split(".").pop();
					const filePath = `${uuidv4()}.${fileExt}`;

					await supabase.storage
						.from("settings")
						.upload(filePath, programPageImageFile);

					const { error } = await supabase
						.from("settings")
						.update({ value: filePath })
						.eq("name", settings[6].name)
						.select()
						.single();

					if (error) {
						setError((uploadError) => [
							...uploadError,
							"Něco se pokazilo při zapisování nového obrázku do tabulky",
						]);
					}
				}
			}

			if (programPageditor.getHTML() != settings[7].value) {
				const { error } = await supabase
					.from("settings")
					.update({ value: programPageditor.getHTML() })
					.eq("name", settings[7].name)
					.select();

				if (error) {
					setError((uploadError) => [
						...uploadError,
						"Něco se pokazilo při náhrávání popisku na hlavní stránce",
					]);
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

			if (publicPageditor.getHTML() != settings[2].value) {
				const { error } = await supabase
					.from("settings")
					.update({ value: publicPageditor.getHTML() })
					.eq("name", settings[2].name)
					.select();

				if (error) {
					setError((uploadError) => [
						...uploadError,
						"Něco se pokazilo při náhrávání popisku na hlavní stránce",
					]);
				}
			}

			if (mainPageEditor.getHTML() != settings[4].value) {
				const { error } = await supabase
					.from("settings")
					.update({ value: mainPageEditor.getHTML() })
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

			if (file.size > 10000000) {
				setError((uploadError) => [
					...uploadError,
					"Obrázek je příliš velký (Max 10MB)",
				]);
				return;
			}

			if (tag == 1) {
				setPublicPageImageFile(file);
			} else if (tag == 2) {
				setMainPageImageFile(file);
			} else {
				setProgramPageImageFile(file);
			}

			if (tag == 1) {
				setPublicPageImageSrc(URL.createObjectURL(file));
			} else if (tag == 2) {
				setMainPageImageSrc(URL.createObjectURL(file));
			} else {
				setProgramPageImageSrc(URL.createObjectURL(file));
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
								<div className={style.editor_area}>
									<MenuBar editor={publicPageditor} />
									{isLoading ? (
										<div
											style={{ cursor: "default" }}
											className={style.editor}
											dangerouslySetInnerHTML={{ __html: publicPageText }}
										/>
									) : (
										<EditorContent
											className={style.editor}
											editor={publicPageditor}
										/>
									)}
								</div>
							</div>
						</div>
					</div>

					<hr />

					<div className={style.public_page}>
						<h2>Program stránka</h2>
						<div className={style.public_page_area}>
							<div className={style.public_page_bg}>
								<div className={style.public_page_image}>
									<Image
										src={
											programPageImageSrc
												? programPageImageSrc
												: `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/settings/${programPageImg}`
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
										onChange={(event) => onChangeUploadFile(event, 3)}
									/>
								</div>
							</div>
							<div className={style.public_page_text}>
								<label>Text stránky s programem</label>
								<div className={style.editor_area}>
									<MenuBar editor={programPageditor} />
									{isLoading ? (
										<div
											style={{ cursor: "default" }}
											className={style.editor}
											dangerouslySetInnerHTML={{ __html: programPageText }}
										/>
									) : (
										<EditorContent
											className={style.editor}
											editor={programPageditor}
										/>
									)}
								</div>
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
								<div className={style.main_page_editor}>
									{isLoading ? (
										<div
											style={{ cursor: "default" }}
											className={style.editor}
											dangerouslySetInnerHTML={{
												__html: mainPageEditor.getHTML(),
											}}
										/>
									) : (
										<EditorContent
											className={style.editor}
											editor={mainPageEditor}
										/>
									)}
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

const MenuBar = ({ editor }) => {
	const [pickedColor, setPickedColor] = useState("#eb4034");
	const [openedColorPicker, setOpenedColorPicker] = useState(false);

	if (!editor) {
		return null;
	}

	return (
		<div className={style.editor_menu}>
			<button
				onClick={() => editor.chain().focus().toggleBold().run()}
				disabled={!editor.can().chain().focus().toggleBold().run()}
				className={editor.isActive("bold") ? style.active_btn : ""}
			>
				<LuBold />
			</button>
			<button
				onClick={() => editor.chain().focus().toggleItalic().run()}
				disabled={!editor.can().chain().focus().toggleItalic().run()}
				className={editor.isActive("italic") ? style.active_btn : ""}
			>
				<LuItalic />
			</button>
			<button
				onClick={() => editor.chain().focus().setParagraph().run()}
				className={editor.isActive("paragraph") ? style.is_active : ""}
			>
				<LuPilcrow />
			</button>
			<button
				onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
				className={
					editor.isActive("heading", { level: 1 }) ? style.is_active : ""
				}
			>
				<LuHeading1 />
			</button>
			<button
				onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
				className={
					editor.isActive("heading", { level: 2 }) ? style.is_active : ""
				}
			>
				<LuHeading2 />
			</button>
			<button
				onClick={() => editor.chain().focus().toggleBulletList().run()}
				className={editor.isActive("bulletList") ? style.is_active : ""}
			>
				<LuList />
			</button>
			<button
				onClick={() => editor.chain().focus().toggleOrderedList().run()}
				className={editor.isActive("orderedList") ? style.is_active : ""}
			>
				<LuListOrdered />
			</button>
			<button
				onClick={() => editor.chain().focus().setColor(pickedColor).run()}
				className={
					editor.isActive("textStyle", { color: pickedColor })
						? style.is_active
						: ""
				}
			>
				<div
					style={{ backgroundColor: pickedColor }}
					className={style.colour_block}
				></div>
				{openedColorPicker && (
					<div className={style.color_picker}>
						<HexColorPicker color={pickedColor} onChange={setPickedColor} />
					</div>
				)}
			</button>
			<button
				onClick={() => setOpenedColorPicker(!openedColorPicker)}
				className={openedColorPicker ? style.is_active : ""}
			>
				<LuPalette />
			</button>
		</div>
	);
};
