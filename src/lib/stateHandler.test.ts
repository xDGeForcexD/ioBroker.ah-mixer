import AHMixerRemote from "ah-mixer-remote";
import Communicator from "ah-mixer-remote/build/lib/communicator/communicator";
import { LevelToMix, Mute, Scenes, Softkey } from "ah-mixer-remote/build/lib/drivers/sq/driver";
import { Mixes, ValueLevel, ValueState } from "ah-mixer-remote/build/lib/types/types";
import { expect } from "chai";
import StateHandler from "./stateHandler";

const sinon = require("sinon");

describe("TestStateHandler", function () {
	let stateHandler: StateHandler;
	let mixer: AHMixerRemote;
	let stubWrite: any;
	let stubConnect: any;
	let stubDisconnect: any;
	let stubSetValue: any = sinon.stub();

	beforeEach(function () {
		mixer = new AHMixerRemote("sq", "111.222.333.444");
		stubWrite = sinon.stub(Communicator.prototype, "write");
		stubConnect = sinon.stub(Communicator.prototype, "connect");
		stubDisconnect = sinon.stub(Communicator.prototype, "disconnect");
		stateHandler = new StateHandler(mixer);
	});

	afterEach(function () {
		stubWrite.restore();
		stubConnect.restore();
		stubDisconnect.restore();
		stubSetValue.restore();
	});

	it("handleChange: ip 2 level lr", function () {
		stubSetValue = sinon.stub(LevelToMix.prototype, "setValueMix");
		stubSetValue.callsFake((mix: Mixes, channel: number, value: ValueLevel) => {
			expect(mix, "mix").to.be.eq(Mixes.LR);
			expect(channel, "channel").to.be.eq(2);
			expect(value.value, "value").to.be.eq(4);
		});

		let called = 0;
		const callback = (id: string, value: string | number | boolean): void => {
			expect(id, "setState id").to.be.eq("inputs.ip02.levelLR");
			expect(value, "setState value").to.be.eq(4);
			called++;
		};

		const handled = stateHandler.handleChange("inputs.ip02.levelLR", 4, callback);

		expect(stubSetValue.calledOnce, "setvalue called").to.be.true;
		expect(handled, "handled ok").to.be.true;
		expect(called, "callback called").to.be.eq(1);
	});
	it("handleChange: ip 12 level aux 2", function () {
		stubSetValue = sinon.stub(LevelToMix.prototype, "setValueMix");
		stubSetValue.callsFake((mix: Mixes, channel: number, value: ValueLevel) => {
			expect(mix, "mix").to.be.eq(Mixes.Aux2);
			expect(channel, "channel").to.be.eq(12);
			expect(value.value, "value").to.be.eq(-10);
		});

		let called = 0;
		const callback = (id: string, value: string | number | boolean): void => {
			expect(id, "setState id").to.be.eq("inputs.ip12.levelAux02");
			expect(value, "setState value").to.be.eq(-10);
			called++;
		};

		const handled = stateHandler.handleChange("inputs.ip12.levelAux02", -10, callback);

		expect(stubSetValue.calledOnce, "setvalue called").to.be.true;
		expect(handled, "handled ok").to.be.true;
		expect(called, "callback called").to.be.eq(1);
	});
	it("handleChange: ip 5 level aux 11", function () {
		stubSetValue = sinon.stub(LevelToMix.prototype, "setValueMix");
		stubSetValue.callsFake((mix: Mixes, channel: number, value: ValueLevel) => {
			expect(mix, "mix").to.be.eq(Mixes.Aux11);
			expect(channel, "channel").to.be.eq(5);
			expect(value.value, "value").to.be.eq("inf");
		});

		let called = 0;
		const callback = (id: string, value: string | number | boolean): void => {
			expect(id, "setState id").to.be.eq("inputs.ip05.levelAux11");
			expect(value, "setState value").to.be.eq("inf");
			called++;
		};

		const handled = stateHandler.handleChange("inputs.ip05.levelAux11", "inf", callback);

		expect(stubSetValue.calledOnce, "setvalue called").to.be.true;
		expect(handled, "handled ok").to.be.true;
		expect(called, "callback called").to.be.eq(1);
	});
	it.skip("handleChange: ip 34 level group 5", function () {});
	it("handleChange: ip 24 mute true", function () {
		stubSetValue = sinon.stub(Mute.prototype, "setValue");
		stubSetValue.callsFake((channel: number, value: ValueState) => {
			expect(channel, "channel").to.be.eq(24);
			expect(value.value, "value").to.be.eq(true);
		});

		let called = 0;
		const callback = (id: string, value: string | number | boolean): void => {
			expect(id, "setState id").to.be.eq("inputs.ip24.mute");
			expect(value, "setState value").to.be.true;
			called++;
		};

		const handled = stateHandler.handleChange("inputs.ip24.mute", true, callback);

		expect(stubSetValue.calledOnce, "setvalue called").to.be.true;
		expect(handled, "handled ok").to.be.true;
		expect(called, "callback called").to.be.eq(1);
	});
	it("handleChange: ip 2 mute false", function () {
		stubSetValue = sinon.stub(Mute.prototype, "setValue");
		stubSetValue.callsFake((channel: number, value: ValueState) => {
			expect(channel, "channel").to.be.eq(2);
			expect(value.value, "value").to.be.eq(false);
		});

		let called = 0;
		const callback = (id: string, value: string | number | boolean): void => {
			expect(id, "setState id").to.be.eq("inputs.ip002.mute");
			expect(value, "setState value").to.be.false;
			called++;
		};

		const handled = stateHandler.handleChange("inputs.ip002.mute", false, callback);

		expect(stubSetValue.calledOnce, "setvalue called").to.be.true;
		expect(handled, "handled ok").to.be.true;
		expect(called, "callback called").to.be.eq(1);
	});
	it("handleChange: wrong ip mute", function () {
		stubSetValue = sinon.stub(Mute.prototype, "setValue");
		stubSetValue.callsFake((channel: number, value: ValueState) => {
			throw new Error("wrong channel");
		});

		let called = 0;
		const callback = (id: string, value: string | number | boolean): void => {
			called++;
		};

		const handled = stateHandler.handleChange("inputs.ip50.mute", false, callback);

		expect(stubSetValue.calledOnce, "setvalue called").to.be.true;
		expect(handled, "handled ok").to.be.false;
		expect(called, "callback called").to.be.eq(0);
	});
	it("handleChange: wrong mix", function () {
		stubSetValue = sinon.stub(LevelToMix.prototype, "setValueMix");

		let called = 0;
		const callback = (id: string, value: string | number | boolean): void => {
			called++;
		};

		const handled = stateHandler.handleChange("inputs.ip02.levelAux20", false, callback);

		expect(stubSetValue.called, "setvalue called").to.be.false;
		expect(handled, "handled ok").to.be.false;
		expect(called, "callback called").to.be.eq(0);
	});
	it("handleChange: scene call", function () {
		stubSetValue = sinon.stub(Scenes.prototype, "setValue");
		stubSetValue.callsFake((channel: number, value: ValueState) => {
			expect(channel, "channel").to.be.eq(30);
			expect(value.value, "value").to.be.eq(true);
		});

		let called = 0;
		const callback = (id: string, value: string | number | boolean): void => {
			expect(id, "setState id").to.be.eq("general.scenes");
			expect(value, "setState value").to.be.eq(30);
			called++;
		};

		const handled = stateHandler.handleChange("general.scenes", 30, callback);

		expect(stubSetValue.calledOnce, "setvalue called").to.be.true;
		expect(handled, "handled ok").to.be.true;
		expect(called, "callback called").to.be.eq(1);
	});
	it("handleChange: scene call wrong scene", function () {
		stubSetValue = sinon.stub(Scenes.prototype, "setValue");
		stubSetValue.callsFake((channel: number, value: ValueState) => {
			throw new Error("wrong scene");
		});

		let called = 0;
		const callback = (id: string, value: string | number | boolean): void => {
			called++;
		};

		const handled = stateHandler.handleChange("general.scenes", 350, callback);

		expect(stubSetValue.called, "setvalue called").to.be.true;
		expect(handled, "handled ok").to.be.false;
		expect(called, "callback called").to.be.eq(0);
	});
	it("handleChange: softkey call", function () {
		stubSetValue = sinon.stub(Softkey.prototype, "setValue");
		stubSetValue.callsFake((channel: number, value: ValueState) => {
			expect(channel, "channel").to.be.eq(3);
			expect(value.value, "value").to.be.eq(true);
		});

		let called = 0;
		const callback = (id: string, value: string | number | boolean): void => {
			expect(id, "setState id").to.be.eq("general.softkeys.key03");
			expect(value, "setState value").to.be.false;
			called++;
		};

		const handled = stateHandler.handleChange("general.softkeys.key03", true, callback);

		expect(stubSetValue.calledOnce, "setvalue called").to.be.true;
		expect(handled, "handled ok").to.be.true;
		expect(called, "callback called").to.be.eq(1);
	});
	it("handleChange: softkey call wrong softkey", function () {
		stubSetValue = sinon.stub(Softkey.prototype, "setValue");
		stubSetValue.callsFake((channel: number, value: ValueState) => {
			throw new Error("wrong softkey");
		});

		let called = 0;
		const callback = (id: string, value: string | number | boolean): void => {
			called++;
		};

		const handled = stateHandler.handleChange("general.softkeys.key18", true, callback);

		expect(stubSetValue.called, "setvalue called").to.be.true;
		expect(handled, "handled ok").to.be.false;
		expect(called, "callback called").to.be.eq(0);
	});
});
