import expect from 'expect.js';

import AsynchronousTypeValidator from './index';

module.exports = {
  AsynchronousTypeValidator: {
    'should be a class': () => {
      expect(AsynchronousTypeValidator).to.be.a(Function);
    }
  }
};
