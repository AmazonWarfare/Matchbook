console.log('MARCO')

// Set PATH stuff for Chrome to work
let chrome = require('selenium-webdriver/chrome');
let chrome_driver = require('chromedriver');
//let chrome_driver = require('/home/travis/build/AmazonWarfare/Matchbook/node_modules/chromedriver/lib/chromedriver/chromedriver')
chrome.setDefaultService(new chrome.ServiceBuilder(chrome_driver.path).build());

const {Builder, By, Key, until, Capabilities} = require('selenium-webdriver');

const chromeCapabilities = Capabilities.chrome();
//chromeCapabilities.set('chromeOptions', {args: ['--headless', '--no-sandbox', '--disable-dev-shm-usage']});
chromeCapabilities.set('chromeOptions', {args: ['--no-sandbox', '--disable-dev-shm-usage']});

(async function example() {
    let driver = await new Builder().withCapabilities(chromeCapabilities).forBrowser('chrome').build();
    //let driver = chrome.Driver.createSession(chromeCapabilities);

    try {
        await driver.get('http://www.google.com/ncr');
        await driver.findElement(By.name('q')).sendKeys('webdriver', Key.RETURN);
        await driver.wait(until.titleIs('webdriver - Google Search'), 1000);
    } finally {
        await driver.quit();
    }
})();

console.log('POLO');