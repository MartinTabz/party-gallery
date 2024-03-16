import ProgramPage from "@components/programpage";
import { cookies } from "next/headers";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import Unauthorised from "@components/unauthorised";

export const dynamic = "force-dynamic";

export default async function Page() {
	const supabase = createServerComponentClient({ cookies });
	const {
		data: { user },
	} = await supabase.auth.getUser();

	if (!user) {
		return <Unauthorised />;
	}

	const { data: settings, error } = await supabase
		.from("settings")
		.select("*")
		.order("rank", { ascending: true });

	if (error) {
		throw new Error(error.message);
	}

	const settingsImgUrl = settings.find(
		(item) => item.name === "program_page_img"
	).value;
	const text = settings.find((item) => item.name === "program_page_text").value;

	return <ProgramPage imgUrl={settingsImgUrl} text={text} />;
}
