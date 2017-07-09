import expect from 'expect.js';
import AbstractTypeProcessor from 'resistdesign-atp';
import AsynchronousTypeValidator from './index';

const ERROR_MESSAGES = {
  INVALID_STRING: 'INVALID_STRING'
};
const TYPE_MAP = {
  String: {
    name: 'String',
    label: 'A Single Line Of Text',
    primitive: true
  },
  Contact: {
    name: 'Contact',
    label: 'Contact',
    fields: {
      firstName: {
        type: 'String',
        features: {
          validation: {
            required: true
          }
        }
      },
      suffix: {
        type: 'String'
      }
    }
  }
};
const MOCK_CONTACT = {
  lastName: 'Last Name'
};
const MOCK_CONTACT_2 = {
  firstName: 'First Name',
  lastName: 'Last Name',
  suffix: true
};
const TYPE_VALIDATOR_MAP = {
  String: value => {
    if (typeof value !== 'string') {
      throw new TypeError(ERROR_MESSAGES.INVALID_STRING);
    }
  }
};

module.exports = {
  AsynchronousTypeValidator: {
    'should be a class': () => {
      expect(AsynchronousTypeValidator).to.be.a(Function);
    },
    processValue: {
      'should trigger the validator for a specific type': async () => {
        const atv = new AsynchronousTypeValidator({
          typeMap: TYPE_MAP,
          typeValidatorMap: TYPE_VALIDATOR_MAP
        });

        let typeError;

        try {
          await atv.processValue(MOCK_CONTACT_2, 'Contact');
        } catch (error) {
          typeError = error;
        }

        expect(typeError).to.be.a(TypeError);
        expect(typeError.message).to.equal(
          AbstractTypeProcessor.ERROR_MESSAGES.ITEM_ERROR
        );
        expect(typeError.fields).to.be.an(Object);
        expect(typeError.fields.suffix).to.be.a(TypeError);
        expect(typeError.fields.suffix.message).to.equal(
          ERROR_MESSAGES.INVALID_STRING
        );
      }
    },
    processFieldValue: {
      'should require a value for a field marked as required': async () => {
        const atv = new AsynchronousTypeValidator({
          typeMap: TYPE_MAP
        });

        let requiredError;

        try {
          await atv.processFieldValue(
            MOCK_CONTACT.firstName,
            'Contact',
            'firstName'
          );
        } catch (error) {
          requiredError = error;
        }

        expect(requiredError).to.be.a(TypeError);
        expect(requiredError.message).to.equal(
          AsynchronousTypeValidator.ERROR_MESSAGES.MISSING_REQUIRED_FIELD
        );
      }
    }
  }
};
