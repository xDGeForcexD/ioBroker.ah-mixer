import AHMixerRemote, * as MixerUtils from "ah-mixer-remote";

class StateReceiver {
	mixer: AHMixerRemote;

	constructor(mixer: AHMixerRemote) {
		this.mixer = mixer;
	}

	setReceiverCallbacks(callbackState: (id: string, value: string | boolean) => void) {
		const modules = this.mixer.getModules();

		modules.forEach((module, key) => {
			module.addCallbackReiceve((channel: number, value: MixerUtils.Types.IValue) => {
				switch (module.key) {
					case "mute":
						callbackState(
							"inputs.ip" +
								this.addZero(this.mixer.driver.details.inputs.toFixed(0).length, channel) +
								".mute",
							<boolean>value.value,
						);
						break;
					case "levelToMix":
						callbackState(
							"inputs.ip" +
								this.addZero(this.mixer.driver.details.inputs.toFixed(0).length, channel) +
								".levelLR",
							<string>value.value,
						);
						break;
				}
			});
			if (key === "levelToMix") {
				const moduleLevelToMix = <MixerUtils.Drivers.SQ.LevelToMix>module;
				moduleLevelToMix.addCallbackReiceveMix(
					(mix: MixerUtils.Types.Mixes, channel: number, value: MixerUtils.Types.IValue) => {
						const mixParsed = MixerUtils.Types.Mixes[mix].replace(/([a-z]+)([0-9]+)/gi, "$1 $2").split(" ");
						if (mixParsed.length == 2) {
							const mixNumber = Number(mixParsed[1]);
							if (!isNaN(mixNumber)) {
								callbackState(
									"inputs.ip" +
										this.addZero(this.mixer.driver.details.inputs.toFixed(0).length, channel) +
										".level" +
										mixParsed[0] +
										this.addZero(this.mixer.driver.details.aux.toFixed(0).length, mixNumber),
									<string>value.value,
								);
							}
						}
					},
				);
			}
		});
	}
	private addZero(zeroCnt: number, figure: number): string {
		let figureString: string = figure.toString();
		for (let i = 1; i < zeroCnt; i++) {
			if (figure < 10 ** i) {
				figureString = "0" + figureString;
			}
		}
		return figureString;
	}
}

export default StateReceiver;
