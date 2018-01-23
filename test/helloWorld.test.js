const hello = require('../helloWorld');

test('says hello world', () => {
    expect(hello()).toBe("Hello World")
});