"use client";

import Link from "next/link";
import { useState } from "react";
import QRCode from "react-qr-code";

export default function Home() {
	const uploadUrl = `${process.env.NEXT_PUBLIC_DOMAIN}/nahrat`;

	return (
		<main>
			<h2>Party Gallery</h2>
			<QRCode
				size={320}
        style={{ margin: "50px"}}
				value={uploadUrl}
				viewBox={`0 0 320 320`}
			/>
      <br />
			<Link href={uploadUrl}>Připojit se</Link>
		</main>
	);
}
