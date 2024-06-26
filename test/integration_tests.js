// File: keycloak-event-gateway/test/integration_tests.js
//
// Run these tests with the following commands:
//
//     $ docker-compose up -d
//     $ npm install
//     $ export SELENIUM_REMOTE_URL=http://localhost:4444/wd/hub
//     $ npx mocha integration_tests.js

import { assert } from 'chai';
import webdriver from 'selenium-webdriver';
import { By } from 'selenium-webdriver';
import fs from 'fs';

const driver = new webdriver.Builder()
	//.forBrowser('firefox')
	.withCapabilities(webdriver.Capabilities.firefox()) // Uses RemoteWebDriver
	.build();

const intent = (message) => () => new Promise((resolve, reject) => {
	console.log('    intent: %s', message);
	resolve();
});

// TODO Use testutil.js from feathers-keycloak-listener
const context = {
	
	mochaContext: null,

	ready: () => Promise.resolve(),
	
	takeScreenshot: () => new Promise((resolve, reject) => {

		driver.takeScreenshot().then((data) => {
	
			++screenshotCount;
			const fileName = screenshotCount.toString().padStart(8, '0') + '.png';
			console.log('      -> screenshot: %s', fileName);
			if (!fs.existsSync('screenshots')) {
				fs.mkdirSync('screenshots');
			}
			const screenshotsDir = 'screenshots';
			fs.writeFileSync(screenshotsDir + '/' + fileName, data, 'base64', (error) => {
				if (error) {
					console.log(error);
					assert.fail('While taking screenshot: ' + fileName);
					reject();
				}
			});

		}).then(resolve, reject);
	}),
};

var screenshotCount = 0;

describe('integration_tests', () => {

	it('browses Keycloak config', (done) => {

		context.ready()

		.then(intent('Login page'))
			.then(() => driver.navigate().to('http://localhost:8080/admin/master/console/'))
			.then(() => driver.sleep(3000))
			.then(() => context.takeScreenshot())

		.then(intent('Credentials'))
			.then(() => driver.findElement(By.id('username')).sendKeys('admin'))
			.then(() => driver.findElement(By.id('password')).sendKeys('adminp'))
			.then(() => context.takeScreenshot())

		.then(intent('Submit the login form'))
			.then(() => driver.findElement(By.id('kc-login')).click())
			.then(() => context.takeScreenshot())

		.then(intent('Deploy the realm list'))
			.then(() => driver.sleep(3000))
			.then(() => driver.findElement(By.id('realm-select')).click())
			.then(() => context.takeScreenshot())

		.then(intent('Add a realm'))
			.then(() => driver.findElement(By.xpath("//a[@data-testid = 'add-realm']")).click())
			.then(() => driver.sleep(2000))
			.then(() => context.takeScreenshot())

		.then(intent('Fill in the realm form'))
			.then(() => driver.findElement(By.id('kc-realm-name')).sendKeys('canigou'))
			.then(() => context.takeScreenshot())

		.then(intent('Submit the realm form'))
			.then(() => driver.findElement(By.css('button.pf-m-primary')).click())
			.then(() => driver.sleep(3000))
			.then(() => context.takeScreenshot())

		.then(intent('Go to the realm settings'))
			.then(() => driver.findElement(By.id('nav-item-realm-settings')).click())
			.then(() => context.takeScreenshot())

		.then(intent('Open the Events tab'))
			.then(() => driver.findElement(By.xpath("//span[text() = 'Events']")).click())
			.then(() => context.takeScreenshot())

		.then(intent('Open the popup listbox'))
			.then(() => driver.findElement(By.xpath("//button[contains(@aria-labelledby, 'eventsListeners')]")).click())
			.then(() => context.takeScreenshot())

		.then(intent('Select: "keycloak-event-gateway" in the listbox'))
			.then(() => driver.findElement(By.xpath("//button[. = 'keycloak-event-gateway']")).click())
			.then(() => context.takeScreenshot())

		.then(intent('Deploy the action menu'))
			.then(() => driver.findElement(By.xpath("//div[@data-testid = 'action-dropdown']")).click())
			.then(() => context.takeScreenshot())

		.then(intent('Ask to delete the realm'))
			.then(() => driver.findElement(By.xpath("//a[text() = 'Delete']")).click())
			.then(() => context.takeScreenshot())

		.then(intent('Confirm the realm deletion'))
			.then(() => driver.findElement(By.xpath("//button[@id = 'modal-confirm']")).click())
			.then(() => driver.sleep(3000))
			.then(() => context.takeScreenshot())

		.then(() => done())
		.catch((error) => {
			console.log(error);
			done(error);
		});
	});

	after((done) => {

		driver
			.then(() => driver.quit())
			.then(() => done())
			.catch((error) => {
				console.log(error);
				done(error);
			});
	});
});
