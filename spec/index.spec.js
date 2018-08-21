let path = require('path');
describe('index', () => {
    it('should be able to parse path all platform', () => {
        let dir;
        if(/^win/.test(process.platform)) {
            dir = 'dist\\app.js'.split(path.sep)[0];
        } else {
            dir = 'dist/app.js'.split(path.sep)[0];
        }
        expect(dir).toBe('dist');
    });
});