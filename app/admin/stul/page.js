import QRCode from "react-qr-code";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

export async function generateMetadata() {
	const supabase = createServerComponentClient({ cookies });

	const {
		data: { user },
	} = await supabase.auth.getUser();

	if (!user) {
		return {
			title: "Nejste oprávnění k přístupu!",
		};
	}

	return {
		title: "Stůl - Administrace",
	};
}

export default function StulPage() {
	const uploadUrl = `${process.env.NEXT_PUBLIC_DOMAIN}/api/self-auth-callback?h=${process.env.HESLO}`;
	console.log(uploadUrl)
	return (
		<>
		<p>{uploadUrl}</p>
		<div>
			<QRCode
				size={320}
				style={{ margin: "50px" }}
				value={uploadUrl}
				viewBox={`0 0 320 320`}
			/>
		</div>
		</>
	);
}
