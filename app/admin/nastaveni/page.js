import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import ManageSettings from "@components/managesettings";

export default async function NastaveniPage() {
	const supabase = createServerComponentClient({ cookies });
	const { data: settings, error } = await supabase
		.from("settings")
		.select("*")
		.order("rank", { ascending: true });
	if (error) {
		throw new Error("Něco se pokazilo při načítání nastavení");
	}
	return (
		<>
			<h1>Nastavení aplikace</h1>
			<ManageSettings settings={settings} />
		</>
	);
}
