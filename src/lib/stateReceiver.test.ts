import AHMixerRemote from "ah-mixer-remote";
import { LevelToMix } from "ah-mixer-remote/build/lib/drivers/sq/driver";
import { Mixes, ValueLevel, ValueState } from "ah-mixer-remote/build/lib/types/types";
import { expect } from "chai";
import StateReceiver from "./stateReceiver";

const sinon = require("sinon");

describe("TestStateHandler", function () {
	let stateReceiver: StateReceiver;
	let mixer: AHMixerRemote;

	beforeEach(function () {
		mixer = new AHMixerRemote("sq", "111.222.333.444");
		stateReceiver = new StateReceiver(mixer);
	});
	afterEach(function () {});

	it("setReceiverCallbacks mute", function () {
		let callbackCalled = 0;
		const callback = (id: string, value: string | boolean) => {
			expect(id, "id").to.be.eq("inputs.ip03.mute");
			expect(value, "value").to.be.true;
			callbackCalled++;
		};

		stateReceiver.setReceiverCallbacks(callback);
		expect(mixer.getModule("mute")?.receiver.length, "callback length").to.be.eq(1);
		mixer.getModule("mute")?.receiver[0](3, new ValueState(true));
		expect(callbackCalled, "callback called").to.be.eq(1);
	});
	it("setReceiverCallbacks levelToMix LR", function () {
		let callbackCalled = 0;
		const callback = (id: string, value: string | boolean) => {
			expect(id, "id").to.be.eq("inputs.ip24.levelLR");
			expect(value, "value").to.be.eq(-33);
			callbackCalled++;
		};

		stateReceiver.setReceiverCallbacks(callback);
		const module = <LevelToMix>mixer.getModule("levelToMix");
		expect(module.receiver.length, "callback length").to.be.eq(1);
		expect(module.receiverMix.length, "callback mix length").to.be.eq(1);
		mixer.getModule("levelToMix")?.receiver[0](24, new ValueLevel(-33));
		expect(callbackCalled, "callback called").to.be.eq(1);
	});
	it("setReceiverCallbacks levelToMix Aux", function () {
		let callbackCalled = 0;
		const callback = (id: string, value: string | boolean) => {
			expect(id, "id").to.be.eq("inputs.ip01.levelAux04");
			expect(value, "value").to.be.eq(-65);
			callbackCalled++;
		};

		stateReceiver.setReceiverCallbacks(callback);
		const module = <LevelToMix>mixer.getModule("levelToMix");
		expect(module.receiver.length, "callback length").to.be.eq(1);
		expect(module.receiverMix.length, "callback mix length").to.be.eq(1);
		module.receiverMix[0](Mixes.Aux4, 1, new ValueLevel(-65));
		expect(callbackCalled, "callback called").to.be.eq(1);
	});
});
