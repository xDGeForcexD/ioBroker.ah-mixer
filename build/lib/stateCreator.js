"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class StateCreator {
    constructor(details) {
        this.inputs = 0;
        this.aux = 0;
        this.fx = 0;
        this.groups = 0;
        this.softkeys = 0;
        if (details.inputs) {
            this.inputs = details.inputs;
        }
        if (details.aux) {
            this.aux = details.aux;
        }
        if (details.fx) {
            this.fx = details.fx;
        }
        if (details.groups) {
            this.groups = details.groups;
        }
        if (details.softkeys) {
            this.softkeys = details.softkeys;
        }
    }
    getObjects() {
        let list = [];
        list = list.concat(this.createGeneralStates());
        list = list.concat(this.createInputStates());
        list = list.concat(this.createMixesStates());
        return list;
    }
    createGeneralStates() {
        const list = [];
        // create softkeys
        list.push({
            id: "general.scenes",
            name: "Scenes Number",
            objectType: "state",
            role: "level",
            type: "number",
        });
        if (this.softkeys > 0) {
            // create input channel
            list.push({
                id: "general.softkeys",
                name: "Softkeys",
                objectType: "channel",
            });
        }
        for (let softkey = 1; softkey <= this.softkeys; softkey++) {
            // create softkeys
            list.push({
                id: "general.softkeys.key" + this.addZero(this.softkeys.toFixed(0).length, softkey),
                name: "Softkey " + softkey,
                objectType: "state",
                role: "button",
                type: "boolean",
            });
        }
        return list;
    }
    createInputStates() {
        const list = [];
        for (let input = 1; input <= this.inputs; input++) {
            const idChannel = "inputs.ip" + this.addZero(this.inputs.toFixed(0).length, input);
            // create input channel
            list.push({
                id: idChannel,
                name: "Ip" + input,
                objectType: "channel",
            });
            // request data
            list.push({
                id: idChannel + ".request",
                name: "Request Data",
                objectType: "state",
                role: "text",
                type: "string",
            });
            // create mute
            list.push({
                id: idChannel + ".mute",
                name: "Mute",
                objectType: "state",
                role: "media.mute",
                type: "boolean",
            });
            // create level mix LR
            list.push({
                id: idChannel + ".levelLR",
                name: "Level LR",
                objectType: "state",
                role: "level.volume",
                type: "string",
            });
            // create level mix auxes
            for (let aux = 1; aux <= this.aux; aux++) {
                list.push({
                    id: idChannel + ".levelAux" + this.addZero(this.aux.toFixed(0).length, aux),
                    name: "Level Aux" + aux,
                    objectType: "state",
                    role: "level.volume",
                    type: "string",
                });
            }
            // create level mix groups
            for (let group = 1; group <= this.groups; group++) {
                list.push({
                    id: idChannel + ".levelGroup" + this.addZero(this.groups.toFixed(0).length, group),
                    name: "Level Group" + group,
                    objectType: "state",
                    role: "level.volume",
                    type: "string",
                });
            }
            // create level mix fx
            for (let fx = 1; fx <= this.fx; fx++) {
                list.push({
                    id: idChannel + ".levelFX" + this.addZero(this.fx.toFixed(0).length, fx),
                    name: "Level FX" + fx,
                    objectType: "state",
                    role: "level.volume",
                    type: "string",
                });
            }
        }
        return list;
    }
    createMixesStates() {
        const list = [];
        // create mix lr// create input channel
        list.push({
            id: "mixes.lr",
            name: "Mix LR",
            objectType: "channel",
        });
        list.push({
            id: "mixes.lr.request",
            name: "Request Data",
            objectType: "state",
            role: "text",
            type: "string",
        });
        list.push({
            id: "mixes.lr.mute",
            name: "Mute",
            objectType: "state",
            role: "media.mute",
            type: "boolean",
        });
        list.push({
            id: "mixes.lr.level",
            name: "Level",
            objectType: "state",
            role: "level.volume",
            type: "string",
        });
        // create mix auxes
        for (let aux = 1; aux <= this.aux; aux++) {
            const idChannel = "mixes.Aux" + this.addZero(this.aux.toFixed(0).length, aux);
            list.push({
                id: idChannel,
                name: "Mix Aux" + aux,
                objectType: "channel",
            });
            list.push({
                id: idChannel + ".request",
                name: "Request Data",
                objectType: "state",
                role: "text",
                type: "string",
            });
            list.push({
                id: idChannel + ".mute",
                name: "Mute",
                objectType: "state",
                role: "media.mute",
                type: "boolean",
            });
            list.push({
                id: idChannel + ".level",
                name: "Level",
                objectType: "state",
                role: "level.volume",
                type: "string",
            });
        }
        return list;
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
exports.default = StateCreator;
