console.log('######################################################################################################################################################');
console.log('Beginning Selinium Testing');

const {Builder, By, Key, until, Capabilities} = require('selenium-webdriver');

(async function test_selenium_functioning() {
    let test_state = 0
    let error

    console.log('######################################################################################################################################################');
    console.log('Executing test: test_selenium_functioning');

    let driver = await new Builder().forBrowser('firefox').withCapabilities(Capabilities.firefox()).build();

    try {
        await driver.get('http://www.google.com/ncr');
        await driver.findElement(By.name('q')).sendKeys('webdriver', Key.RETURN);
        await driver.wait(until.titleIs('webdriver - Google Search'), 1000);

        console.log('test_selenium_functioning PASSED');
        console.log('######################################################################################################################################################');
    } catch (err) {
        test_state = 1
        error = err
    } finally {
        await driver.quit();

        if (test_state == 1) {
            console.log('test_selenium_functioning FAILED');
            console.log('######################################################################################################################################################');
            throw error
        }
    }
})();

(async function test_selenium_functioning2() {
    let test_state = 0
    let error

    console.log('######################################################################################################################################################');
    console.log('Executing test: test_selenium_functioning2');

    let driver = await new Builder().forBrowser('firefox').withCapabilities(Capabilities.firefox()).build();

    try {
        await driver.get('http://www.sadklfjsdalfkj.com/ncr');
        await driver.findElement(By.name('q')).sendKeys('webdriver', Key.RETURN);
        await driver.wait(until.titleIs('webdriver - Google Search'), 1000);

        console.log('test_selenium_functioning2 PASSED');
        console.log('######################################################################################################################################################');
    } catch (err) {
        test_state = 1
        error = err
    } finally {
        await driver.quit();

        if (test_state == 1) {
            console.log('test_selenium_functioning2 FAILED');
            console.log('######################################################################################################################################################');
            new Promise((_, reject) => reject({ test: 'woops!' })).catch(() => {});
        }
    }
})();