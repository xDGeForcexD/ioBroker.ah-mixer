import AHMixerRemote, * as MixerUtils from "ah-mixer-remote";

class StateHandler {
	mixer: AHMixerRemote;

	constructor(mixer: AHMixerRemote) {
		this.mixer = mixer;
	}

	handleChange(
		id: string,
		value: string | number | boolean,
		callbackSetState: (id: string, value: string | number | boolean) => void,
	): boolean {
		const idParsedGeneral = this.parseGenerals(id);
		const idParsedWithChannel = this.parseWithChannel(id);
		if (idParsedGeneral === undefined && idParsedWithChannel === undefined) {
			return false;
		} else if (idParsedGeneral !== undefined) {
			if (this.checkScenes(idParsedGeneral, value)) {
				callbackSetState(id, value);
				return true;
			}
			if (idParsedGeneral.channel !== undefined) {
				if (this.checkSoftkey({ type: idParsedGeneral.type, channel: idParsedGeneral.channel }, value)) {
					callbackSetState(id, false);
					return true;
				}
			}
		} else if (idParsedWithChannel !== undefined) {
			if (this.checkInputs(idParsedWithChannel, value)) {
				callbackSetState(id, value);
				return true;
			}
			if (this.checkMixes(idParsedWithChannel, value)) {
				callbackSetState(id, value);
				return true;
			}
		}

		return false;
	}

	private parseGenerals(id: string): { type: string; channel?: number } | undefined {
		const idParts = id.split(".");
		let offset = idParts.length - 3;
		let simpleType = false;
		let channelOf = idParts[offset++];
		if (channelOf !== "general") {
			simpleType = true;
			channelOf = idParts[offset++];
			if (channelOf !== "general") {
				return undefined;
			}
		}
		if (simpleType) {
			return { type: idParts[offset] };
		} else {
			const channel = Number(idParts[offset + 1].replace(/([a-z]*)0*([0-9]+)/i, "$2"));
			if (isNaN(channel)) {
				return undefined;
			}
			return { type: idParts[offset], channel: channel };
		}
	}

	private parseWithChannel(id: string): IIdParsed | undefined {
		const idParts = id.split(".");
		const channelOf = idParts[idParts.length - 3];
		if (channelOf !== "inputs" && channelOf !== "mixes") {
			return undefined;
		}
		const channel = idParts[idParts.length - 2].match(/[a-z]+|[^a-z]+/gi);
		if (channel?.length !== 2) {
			return undefined;
		}
		const type = idParts[idParts.length - 1].replace(/([a-z0-9])([A-Z])/g, "$1 $2").split(" ");
		if (type === null || type.length > 2) {
			return undefined;
		}
		let typeFormated: string | { type: string; mix: string };
		if (type.length === 1) {
			typeFormated = type[0];
		} else {
			typeFormated = { type: type[0], mix: type[1].replace(/([a-z])0+([0-9])/i, "$1$2") };
		}
		return {
			channelOf: <"inputs" | "mixes">idParts[idParts.length - 3],
			channel: Number(channel[1]),
			type: typeFormated,
		};
	}

	private checkScenes(id: { type: string }, value: string | number | boolean): boolean {
		if (id.type === "scenes" && typeof value === "number") {
			const module = this.mixer.getModule("scenes");
			if (module !== undefined) {
				try {
					module.setValue(value, new MixerUtils.Types.ValueState(true));
					return true;
				} catch (e) {}
			}
		}
		return false;
	}
	private checkSoftkey(id: { type: string; channel: number }, value: string | number | boolean): boolean {
		if (id.type === "softkeys" && typeof value === "boolean") {
			const module = this.mixer.getModule("softkey");
			if (module !== undefined) {
				try {
					module.setValue(id.channel, new MixerUtils.Types.ValueState(value));
					return true;
				} catch (e) {}
			}
		}
		return false;
	}

	private checkInputs(id: IIdParsed, value: string | number | boolean): boolean {
		if (id.channelOf !== "inputs") {
			return false;
		}
		let module: MixerUtils.Module | undefined;
		if (typeof id.type === "string") {
			switch (id.type) {
				case "mute":
					module = this.mixer.getModule("mute");
					if (module !== undefined) {
						if (typeof value !== "boolean") {
							return false;
						}
						try {
							module.setValue(id.channel, new MixerUtils.Types.ValueState(value));
							return true;
						} catch (e) {}
					}
					break;
				case "level":
					// not implemented
					// TODO on lib
					break;
			}
		} else {
			switch (id.type.type) {
				case "level":
					module = this.mixer.getModule("levelToMix");
					// TODO
					// CHANGE TO MODULE CLASS NOT DRIVER SPECIFIC
					if (module instanceof MixerUtils.Drivers.SQ.LevelToMix) {
						let valueLevel: MixerUtils.Types.ValueLevel;
						if (value === "inf") {
							valueLevel = new MixerUtils.Types.ValueLevel("inf");
						} else if (!isNaN(Number(value))) {
							valueLevel = new MixerUtils.Types.ValueLevel(Number(value));
						} else {
							return false;
						}
						const mix: MixerUtils.Types.Mixes | undefined = (<any>MixerUtils.Types.Mixes)[id.type.mix];
						if (mix === undefined) {
							return false;
						}
						try {
							module.setValueMix(mix, id.channel, valueLevel);
							return true;
						} catch (e) {}
					}
					break;
			}
		}
		return false;
	}

	private checkMixes(id: IIdParsed, value: string | number | boolean): boolean {
		return false;
	}
}

interface IIdParsed {
	channelOf: "inputs" | "mixes" | "general";
	channel: number;
	type: string | ITypeMix;
}

interface ITypeMix {
	type: string;
	mix: string;
}

export default StateHandler;
