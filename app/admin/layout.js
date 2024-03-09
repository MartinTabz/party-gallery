import { cookies } from "next/headers";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import AdminLoginForm from "@components/adminlogin";

export default async function AdminPage({ children }) {
	const supabase = createServerComponentClient({ cookies });
	const {
		data: { user },
	} = await supabase.auth.getUser();

	if (!user) {
		return <AdminLoginForm />;
	}

	return <main>{children}</main>;
}
