/**
 * https://resistdesign.github.io/resistdesign-atp
 * */
import AsynchronousTypeProcessor from 'resistdesign-atp';

/**
 * @class AsynchronousTypeValidator
 * Validate data of a given type contained within the type map.
 * */
export default class AsynchronousTypeValidator
  extends AsynchronousTypeProcessor {
  static ERROR_MESSAGES = {
    VALIDATION_ERROR: 'VALIDATION_ERROR',
    MISSING_REQUIRED_FIELD: 'MISSING_REQUIRED_FIELD'
  };
  static ERROR_TYPES = {
    INVALID_VALUE: 'INVALID_VALUE',
    INVALID_ITEM: 'INVALID_ITEM',
    INVALID_ITEM_LIST: 'INVALID_ITEM_LIST',
  };
  static FEATURE_NAME = 'validation';
  static INVALID_REQUIRED_VALUES = [null, undefined];
  static FEATURE_VALIDATORS = {
    required: async (config, value, typeName, fieldName) => {
      if (
        config &&
        AsynchronousTypeValidator.INVALID_REQUIRED_VALUES.indexOf(value) !== -1
      ) {
        throw new Error(
          AsynchronousTypeValidator.ERROR_MESSAGES.MISSING_REQUIRED_FIELD
        );
      }
    }
  };

  static createValidationError (type) {
    const validationError = new Error(
      AsynchronousTypeValidator.ERROR_MESSAGES.VALIDATION_ERROR
    );
    validationError.type = type;
    validationError.reasons = {};

    return validationError;
  }

  static shouldThrowError (error) {
    if (
      error instanceof Error &&
      error.reasons instanceof Object &&
      Object.keys(error.reasons).length
    ) {
      return true;
    } else {
      return false;
    }
  }

  valueValidatorMap;
  itemValidatorMap;

  constructor (config) {
    super(config);
  }

  /**
   * Validate a primitive value for the given field of a given type.
   * @param {*} value The value to be validated.
   * @param {string} typeName The name of the type.
   * @param {string} fieldName The name of the field.
   * */
  async validateValue (value, typeName, fieldName) {
    if (this.valueValidatorMap instanceof Object) {
      const validationFeature = await this.getFieldFeature(
          typeName,
          fieldName,
          AsynchronousTypeValidator.FEATURE_NAME
        ) || {};
      const { valueValidators } = validationFeature;

      if (valueValidators instanceof Array) {
        const validationError = AsynchronousTypeValidator.createValidationError(
          AsynchronousTypeValidator.ERROR_TYPES.INVALID_VALUE
        );

        for (let i = 0; i < valueValidators.length; i++) {
          const validatorName = valueValidators[i];
          const validator = this.valueValidatorMap[validatorName];

          if (validator instanceof Function) {
            try {
              await validator(value, typeName, fieldName, valueValidators);
            } catch (error) {
              validationError.reasons[validatorName] = error;
            }
          }
        }

        if (AsynchronousTypeValidator.shouldThrowError(validationError)) {
          throw validationError;
        }
      }
    }
  }

  /**
   * Validate an item of a given type.
   * @param {Object} item The item to validate.
   * @param {string} typeName The name of the type.
   * */
  async validateItem (item, typeName) {

  }

  /**
   * @override
   * */
  async processValue (value, typeName, fieldName) {
    const validationFeature = await this.getFieldFeature(
        typeName,
        fieldName,
        AsynchronousTypeValidator.FEATURE_NAME
      ) || {};

    // Field level feature validations.
    for (const k in AsynchronousTypeValidator.FEATURE_VALIDATORS) {
      if (AsynchronousTypeValidator.FEATURE_VALIDATORS.hasOwnProperty(k)) {
        const featureValidator = AsynchronousTypeValidator.FEATURE_VALIDATORS[k];

        await featureValidator(
          validationFeature[k],
          value,
          typeName,
          fieldName
        );
      }
    }

    // Mapped value validators.
    await this.validateValue(value, typeName, fieldName);

    return super.processValue(value, typeName, fieldName);
  }
}
