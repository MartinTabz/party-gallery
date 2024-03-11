import QRCode from "react-qr-code";

export default function StulPage() {
	const uploadUrl = `${process.env.NEXT_PUBLIC_DOMAIN}/api/self-auth-callback?h=${process.env.HESLO}`;
	console.log(uploadUrl)
	return (
		<div>
			<QRCode
				size={320}
				style={{ margin: "50px" }}
				value={uploadUrl}
				viewBox={`0 0 320 320`}
			/>
		</div>
	);
}
