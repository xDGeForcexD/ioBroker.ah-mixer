"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const utils = require("@iobroker/adapter-core");
const ah_mixer_remote_1 = require("ah-mixer-remote");
const stateCreator_1 = require("./lib/stateCreator");
const stateHandler_1 = require("./lib/stateHandler");
const stateReceiver_1 = require("./lib/stateReceiver");
class AhMixer extends utils.Adapter {
    constructor(options = {}) {
        super(Object.assign(Object.assign({}, options), { name: "ah-mixer" }));
        this.mixer = null;
        this.on("ready", this.onReady.bind(this));
        this.on("stateChange", this.onStateChange.bind(this));
        this.on("unload", this.onUnload.bind(this));
    }
    /**
     * Is called when databases are connected and adapter received configuration.
     */
    onReady() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.mixer === null) {
                if (this.config.driver === "" || this.config.driver === undefined) {
                    this.log.error("no driver is set");
                }
                else if (this.config.ip === "" || this.config.ip === undefined) {
                    this.log.error("no ip is set");
                }
                else {
                    // create mixer instance
                    this.mixer = new ah_mixer_remote_1.default(this.config.driver, this.config.ip);
                    // set online callback
                    this.mixer.setCallbackConnection((status) => {
                        this.setState("info.connection", status, true);
                    });
                    // set receive callback
                    const stateReceiver = new stateReceiver_1.default(this.mixer);
                    stateReceiver.setReceiverCallbacks((id, value) => {
                        this.setState(id, value, true);
                    });
                    // create states
                    const details = this.mixer.driver.details;
                    const stateCreator = new stateCreator_1.default(details);
                    stateCreator.getObjects().forEach((item) => {
                        var _a;
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
                                        role: item.role,
                                        read: ((_a = item.role) === null || _a === void 0 ? void 0 : _a.search("button")) === -1 ? true : false,
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
        });
    }
    /**
     * Is called when adapter shuts down - callback has to be called under any circumstances!
     */
    onUnload(callback) {
        try {
            if (this.mixer instanceof ah_mixer_remote_1.default) {
                this.mixer.disconnect();
            }
            callback();
        }
        catch (e) {
            callback();
        }
    }
    /**
     * Is called if a subscribed state changes
     */
    onStateChange(id, state) {
        if (this.mixer instanceof ah_mixer_remote_1.default && state && state.ack === false) {
            if (typeof state.val === "string" || typeof state.val === "number" || typeof state.val === "boolean") {
                const stateHandler = new stateHandler_1.default(this.mixer);
                stateHandler.handleChange(id, state.val, (id, value) => {
                    this.setState(id, value, true);
                });
            }
        }
    }
}
if (module.parent) {
    module.exports = (options) => new AhMixer(options);
}
else {
    (() => new AhMixer())();
}
