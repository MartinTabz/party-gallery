import Image from "next/image";
import style from "@styles/program.module.css";
import Link from "next/link";

export default function ProgramPage({ text, imgUrl }) {
	return (
		<section className={style.section}>
			<div className={style.area}>
				<div dangerouslySetInnerHTML={{ __html: text }} />
			</div>

			<Link className={style.button} href={"/"}>
				Pokračovat
			</Link>
			<div className={style.bg}></div>
			<Image
				className={style.image}
				width={600}
				height={400}
				src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/settings/${imgUrl}`}
				alt="Pozadí"
			/>
		</section>
	);
}
