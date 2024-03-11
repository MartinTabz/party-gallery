import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import ManageSettings from "@components/managesettings";

export const dynamic = "force-dynamic";

export default async function NastaveniPage() {
	const supabase = createServerComponentClient({ cookies });
	const { data: settings, error } = await supabase
		.from("settings")
		.select("*")
		.order("rank", { ascending: true });
	if (error) {
		throw new Error("Něco se pokazilo při načítání nastavení");
	}
	return <ManageSettings settings={settings} />;
}
