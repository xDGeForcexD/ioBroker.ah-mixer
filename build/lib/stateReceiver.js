"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const MixerUtils = require("ah-mixer-remote");
class StateReceiver {
    constructor(mixer) {
        this.mixer = mixer;
    }
    setReceiverCallbacks(callbackState) {
        const modules = this.mixer.getModules();
        modules.forEach((module, key) => {
            module.addCallbackReiceve((channel, value) => {
                switch (module.key) {
                    case "mute":
                        callbackState("inputs.ip" +
                            this.addZero(this.mixer.driver.details.inputs.toFixed(0).length, channel) +
                            ".mute", value.value);
                        break;
                    case "levelToMix":
                        callbackState("inputs.ip" +
                            this.addZero(this.mixer.driver.details.inputs.toFixed(0).length, channel) +
                            ".levelLR", value.value);
                        break;
                }
            });
            if (key === "levelToMix") {
                const moduleLevelToMix = module;
                moduleLevelToMix.addCallbackReiceveMix((mix, channel, value) => {
                    const mixParsed = MixerUtils.Types.Mixes[mix].replace(/([a-z]+)([0-9]+)/gi, "$1 $2").split(" ");
                    if (mixParsed.length == 2) {
                        const mixNumber = Number(mixParsed[1]);
                        if (!isNaN(mixNumber)) {
                            callbackState("inputs.ip" +
                                this.addZero(this.mixer.driver.details.inputs.toFixed(0).length, channel) +
                                ".level" +
                                mixParsed[0] +
                                this.addZero(this.mixer.driver.details.aux.toFixed(0).length, mixNumber), value.value);
                        }
                    }
                });
            }
        });
    }
    addZero(zeroCnt, figure) {
        let figureString = figure.toString();
        for (let i = 1; i < zeroCnt; i++) {
            if (figure < Math.pow(10, i)) {
                figureString = "0" + figureString;
            }
        }
        return figureString;
    }
}
exports.default = StateReceiver;
