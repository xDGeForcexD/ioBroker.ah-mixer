interface IObjectFormat {
	objectType: "device" | "channel" | "state";
	id: string;
	name: string;
	role?: string;
	type?: "string" | "number" | "boolean" | "object" | "array" | "mixed" | "file" | undefined;
}

export default IObjectFormat;
