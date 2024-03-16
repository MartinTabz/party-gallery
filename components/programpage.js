import Image from "next/image";

export default function ProgramPage({ text, imgUrl }) {
	return (
		<section>
			<div dangerouslySetInnerHTML={{ __html: text }} />
			<Image
				width={600}
				height={400}
				src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/settings/${imgUrl}`}
				alt="Pozadí"
			/>
		</section>
	);
}
