import { expect } from "chai";
import IObjectFormat from "./iObjectFormat";
import StateCreator from "./stateCreator";

const sinon = require("sinon");

describe("TestStateCreator", function () {
	it("check state cnt", function () {
		const stateCreator = new StateCreator({ inputs: 12, aux: 3, fx: 5, groups: 6, softkeys: 6 });

		const states = stateCreator.getObjects();

		// calculate:
		// general: scenes, softkeys
		// general = 1 		+ 6 + 1
		// input: channel,  request, mute, lr,   auxes,   fx,      groups
		// input = 1        +1       + 1   + 1   + 3 + 5 + 6 = 18
		// inputs = 12 * input = 216
		// mix: channel,  request, mute, level
		// mix = 1        +1       +1    +1 = 4
		// mixes: lr, auxes
		// mixes = (1 + 3) * mix = 16
		// gesamt = genaral + inputs + mixes = 240

		expect(states.length).to.be.eq(240);
	});
	it("check state cnt without mixes and softkeys", function () {
		const stateCreator = new StateCreator({
			inputs: 12,
			aux: 0,
			fx: 0,
			groups: 0,
			softkeys: 0,
		});

		const states = stateCreator.getObjects();

		// calculate:
		// general: scenes, softkeys
		// general = 1 		+ 0
		// input: channel,  request, mute, lr,   auxes,   fx,      groups
		// input = 1        +1       + 1   + 1   + 0 + 0 + 0 = 4
		// inputs = 12 * input = 48
		// mix: channel,  request, mute, level
		// mix = 1        +1       +1    +1 = 4
		// mixes: lr, auxes
		// mixes = (1 + 0) * mix = 4
		// gesamt = general + inputs + mixes = 53

		expect(states.length).to.be.eq(53);
	});
	it("check state cnt without inputs and mixes", function () {
		const stateCreator = new StateCreator({
			inputs: 0,
			aux: 0,
			fx: 0,
			groups: 0,
			softkeys: 2,
		});

		const states = stateCreator.getObjects();

		// calculate:
		// general: scenes, softkeys
		// general = 1 		+ 2 + 1
		// input: channel,  request, mute, lr,   auxes,   fx,      groups
		// input = 1        +1       + 1   + 1   + 0 + 0 + 0 = 4
		// inputs = 0 * input = 0
		// mix: channel,  request, mute, level
		// mix = 1        +1       +1    +1 = 4
		// mixes: lr, auxes
		// mixes = (1 + 0) * mix = 4
		// gesamt = general inputs + mixes = 8

		expect(states.length).to.be.eq(8);
	});
	it("check zero format one zero", function () {
		const stateCreator = new StateCreator({ inputs: 14, aux: 0, fx: 0, groups: 0, softkeys: 0 });

		const states = stateCreator.getObjects();
		expect(states[1].id).to.be.eq("inputs.ip01");
	});
	it("check zero format two zero", function () {
		const stateCreator = new StateCreator({ inputs: 100, aux: 0, fx: 0, groups: 0, softkeys: 0 });

		const states = stateCreator.getObjects();
		expect(states[1].id, "ip1").to.be.eq("inputs.ip001");
		expect(states[49].id, "ip13").to.be.eq("inputs.ip013");
	});
	it("check if scenes exists", function () {
		const stateCreator = new StateCreator({ inputs: 21, aux: 3, fx: 4, groups: 1 });

		const stateShould: IObjectFormat = {
			id: "general.scenes",
			name: "Scenes Number",
			role: "level",
			type: "number",
			objectType: "state",
		};

		const states = stateCreator.getObjects();
		expect(states).to.deep.include(stateShould);
	});
	it("check if softkey 7 exists", function () {
		const stateCreator = new StateCreator({ inputs: 21, aux: 3, fx: 4, groups: 1, softkeys: 14 });

		const stateShould: IObjectFormat = {
			id: "general.softkeys.key07",
			name: "Softkey 7",
			role: "button",
			type: "boolean",
			objectType: "state",
		};

		const states = stateCreator.getObjects();
		expect(states).to.deep.include(stateShould);
	});
	it("check if request on ip3 exists", function () {
		const stateCreator = new StateCreator({ inputs: 100, aux: 0, fx: 0, groups: 0 });

		const stateShould: IObjectFormat = {
			id: "inputs.ip003.request",
			name: "Request Data",
			role: "text",
			type: "string",
			objectType: "state",
		};

		const states = stateCreator.getObjects();
		expect(states).to.deep.include(stateShould);
	});
	it("check if mute on ip17 exists", function () {
		const stateCreator = new StateCreator({ inputs: 21, aux: 3, fx: 4, groups: 1 });

		const stateShould: IObjectFormat = {
			id: "inputs.ip17.mute",
			name: "Mute",
			role: "media.mute",
			type: "boolean",
			objectType: "state",
		};

		const states = stateCreator.getObjects();
		expect(states).to.deep.include(stateShould);
	});
	it("check if level LR on ip41 exists", function () {
		const stateCreator = new StateCreator({ inputs: 48, aux: 3, fx: 2, groups: 1 });

		const stateShould: IObjectFormat = {
			id: "inputs.ip41.levelLR",
			name: "Level LR",
			role: "level.volume",
			type: "string",
			objectType: "state",
		};

		const states = stateCreator.getObjects();
		expect(states).to.deep.include(stateShould);
	});
	it("check if level Aux2 on ip2 exists", function () {
		const stateCreator = new StateCreator({ inputs: 48, aux: 3, fx: 2, groups: 1 });

		const stateShould: IObjectFormat = {
			id: "inputs.ip02.levelAux2",
			name: "Level Aux2",
			role: "level.volume",
			type: "string",
			objectType: "state",
		};

		const states = stateCreator.getObjects();
		expect(states).to.deep.include(stateShould);
	});
	it("check if level on mixes Aux 5 exists", function () {
		const stateCreator = new StateCreator({ inputs: 48, aux: 132, fx: 2, groups: 1 });

		const stateShould: IObjectFormat = {
			id: "mixes.Aux005.level",
			name: "Level",
			role: "level.volume",
			type: "string",
			objectType: "state",
		};

		const states = stateCreator.getObjects();
		expect(states).to.deep.include(stateShould);
	});
});
