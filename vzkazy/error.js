"use client";

import ErrorComponent from "@components/error";

export default function Error({ reload, error }) {
	return <ErrorComponent reload={reload} error={error} />;
}
