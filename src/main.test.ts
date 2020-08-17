import { tests, utils } from "@iobroker/testing";
import path = require("path");

tests.unit(path.join(__dirname, ".."), {
	//     ~~~~~~~~~~~~~~~~~~~~~~~~~
	// This should be the adapter's root directory

	// Define your own tests inside defineAdditionalTests
	defineAdditionalTests() {
		// Create mocks and asserts
		const { adapter, database } = utils.unit.createMocks({});

		describe.only("my test", () => {
			afterEach(() => {
				// The mocks keep track of all method invocations - reset them after each single test
				adapter.resetMockHistory();
				// We want to start each test with a fresh database
				database.clear();
			});

			it("works", () => {
				// Do something that should be tested
				console.log(database.getObjects("*"));
			});
		});
	},
});
