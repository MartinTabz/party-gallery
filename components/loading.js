import style from "@styles/loading.module.css";
import { FiLoader } from "react-icons/fi";

export default function LoadingComponent() {
	return (
		<main className={style.area}>
			<FiLoader color="var(--clr-main)" className={style.spinner} />
		</main>
	);
}
