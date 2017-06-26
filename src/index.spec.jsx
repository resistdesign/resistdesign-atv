import expect from 'expect.js';
import AsynchronousTypeValidator from './index';

const TYPE_MAP = {
  String: (value) => {
    if (
      value !== null &&
      typeof value !== 'undefined' &&
      typeof value !== 'string'
    ) {
      throw new TypeError('INVALID_STRING');
    }
  },
  Contact: {
    fields: {
      firstName: {
        type: 'String',
        features: {
          validation: {
            required: true
          }
        }
      }
    }
  }
};
const MOCK_CONTACT = {
  lastName: 'Last Name'
};

module.exports = {
  AsynchronousTypeValidator: {
    'should be a class': () => {
      expect(AsynchronousTypeValidator).to.be.a(Function);
    },
    processValue: {
      'should require a value for a field marked as required': async () => {
        const atv = new AsynchronousTypeValidator({
          typeMap: TYPE_MAP
        });

        let requiredError;

        try {
          await atv.processValue(
            MOCK_CONTACT.firstName,
            'Contact',
            'firstName'
          );
        } catch (error) {
          requiredError = error;
        }

        expect(requiredError).to.be.an(Error);
        expect(requiredError.message).to.equal(
          AsynchronousTypeValidator.ERROR_MESSAGES.MISSING_REQUIRED_FIELD
        );
      }
    }
  }
};
