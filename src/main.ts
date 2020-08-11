import * as utils from "@iobroker/adapter-core";
import AHMixerRemote from "ah-mixer-remote";
import StateCreator from "./lib/stateCreator";
import StateHandler from "./lib/stateHandler";
import StateReceiver from "./lib/stateReceiver";

// Augment the adapter.config object with the actual types
// TODO: delete this in the next version
declare global {
	// eslint-disable-next-line @typescript-eslint/no-namespace
	namespace ioBroker {
		interface AdapterConfig {
			driver: string;
			ip: string;
			name: string;
		}
	}
}

class AhMixer extends utils.Adapter {
	mixer: AHMixerRemote | null = null;

	public constructor(options: Partial<utils.AdapterOptions> = {}) {
		super({
			...options,
			name: "ah-mixer",
		});
		this.on("ready", this.onReady.bind(this));
		this.on("stateChange", this.onStateChange.bind(this));
		this.on("unload", this.onUnload.bind(this));
	}

	/**
	 * Is called when databases are connected and adapter received configuration.
	 */
	private async onReady(): Promise<void> {
		if (this.mixer === null) {
			if (this.config.driver === "" || this.config.driver === undefined) {
				this.log.error("no driver is set");
			} else if (this.config.ip === "" || this.config.ip === undefined) {
				this.log.error("no ip is set");
			} else {
				// create mixer instance
				this.mixer = new AHMixerRemote(this.config.driver, this.config.ip);
				// set online callback
				this.mixer.setCallbackConnection((status: boolean) => {
					this.setState("info.connection", status, true);
				});
				// set receive callback
				const stateReceiver = new StateReceiver(this.mixer);
				stateReceiver.setReceiverCallbacks((id: string, value: string | boolean) => {
					this.setState(id, value, true);
				});
				// create states
				const details = this.mixer.driver.details;
				const stateCreator = new StateCreator(details);
				stateCreator.getObjects().forEach((item) => {
					switch (item.objectType) {
						case "channel":
							this.setObjectNotExists(item.id, {
								type: "channel",
								common: {
									name: item.name,
								},
								native: {},
							});
							break;
						case "state":
							this.setObjectNotExists(item.id, {
								type: "state",
								common: {
									name: item.name,
									type: item.type,
									role: item.role!,
									read: item.role?.search("button") === -1 ? true : false,
									write: true,
								},
								native: {},
							});
							break;
					}
				});
				// connect to mixer
				this.mixer.connect();
				// TODO
				// Maybe change ...
				// subscribe states
				this.subscribeStates("*");
			}
		}
	}

	/**
	 * Is called when adapter shuts down - callback has to be called under any circumstances!
	 */
	private onUnload(callback: () => void): void {
		try {
			if (this.mixer instanceof AHMixerRemote) {
				this.mixer.disconnect();
			}
			callback();
		} catch (e) {
			callback();
		}
	}

	/**
	 * Is called if a subscribed state changes
	 */
	private onStateChange(id: string, state: ioBroker.State | null | undefined): void {
		if (this.mixer instanceof AHMixerRemote && state && state.ack === false) {
			if (typeof state.val === "string" || typeof state.val === "number" || typeof state.val === "boolean") {
				const stateHandler = new StateHandler(this.mixer);
				stateHandler.handleChange(id, state.val, (id: string, value: string | number | boolean) => {
					this.setState(id, value, true);
				});
			}
		}
	}
}

if (module.parent) {
	module.exports = (options: Partial<utils.AdapterOptions> | undefined) => new AhMixer(options);
} else {
	(() => new AhMixer())();
}
