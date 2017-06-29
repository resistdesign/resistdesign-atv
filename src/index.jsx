/**
 * https://resistdesign.github.io/resistdesign-atp
 * */
import AsynchronousTypeProcessor from 'resistdesign-atp';

/**
 * @function
 * @param {*} value The value to be validated.
 * @param {string} typeName The name of the type.
 * @param {string} fieldName The name of the field.
 * @param {Array.<string>} valueValidators The array of validator function names
 * from the validation feature configuration on a field descriptor.
 * @throws {*} An error structure when the value is invalid.
 * */
function ValueValidationFunction (value, typeName, fieldName, valueValidators) {
}

/**
 * @function
 * @param {Object} item The item to validate.
 * @param {string} typeName The name of the type.
 * @param {Array.<string>} itemValidators The array of validator function names
 * from the type definition.
 * @throws {*} An error structure when the item is invalid.
 * */
function ItemValidationFunction (item, typeName, itemValidators) {

}

/**
 * @class AsynchronousTypeValidator
 * Validate data of a given type contained within the type map.
 * */
export default class AsynchronousTypeValidator
  extends AsynchronousTypeProcessor {
  static ERROR_MESSAGES = {
    VALIDATION_ERROR: 'VALIDATION_ERROR',
    MISSING_REQUIRED_FIELD: 'MISSING_REQUIRED_FIELD',
    INCORRECT_NUMBER_OF_ITEMS: 'INCORRECT_NUMBER_OF_ITEMS',
    LESS_THAN_MINIMUM_NUMBER_OF_ITEMS: 'LESS_THAN_MINIMUM_NUMBER_OF_ITEMS',
    GREATER_THAN_MAXIMUM_NUMBER_OF_ITEMS: 'GREATER_THAN_MAXIMUM_NUMBER_OF_ITEMS'
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
    },
    requiredLength: async (config, value, typeName, fieldName) => {
      if (
        typeof config === 'number' &&
        (
          !(value instanceof Array) ||
          value.length !== config
        )
      ) {
        const error = new Error(
          AsynchronousTypeValidator.ERROR_MESSAGES.INCORRECT_NUMBER_OF_ITEMS
        );
        error.data = config;

        throw error;
      }
    },
    requiredLengthAtLeast: async (config, value, typeName, fieldName) => {
      if (
        typeof config === 'number' &&
        (
          !(value instanceof Array) ||
          value.length < config
        )
      ) {
        const error = new Error(
          AsynchronousTypeValidator
            .ERROR_MESSAGES.LESS_THAN_MINIMUM_NUMBER_OF_ITEMS
        );
        error.data = config;

        throw error;
      }
    },
    requiredLengthAtMost: async (config, value, typeName, fieldName) => {
      if (
        typeof config === 'number' &&
        value instanceof Array &&
        value.length > config
      ) {
        const error = new Error(
          AsynchronousTypeValidator
            .ERROR_MESSAGES.GREATER_THAN_MAXIMUM_NUMBER_OF_ITEMS
        );
        error.data = config;

        throw error;
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
    return error instanceof Error &&
      error.reasons instanceof Object &&
      Object.keys(error.reasons).length;
  }

  /**
   * A map of value validation functions.
   * @member {Object.<string, ValueValidationFunction>}
   * */
  valueValidatorMap;

  /**
   * A map of item validation functions.
   * @member {Object.<string, ItemValidationFunction>}
   * */
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
    if (this.itemValidatorMap instanceof Object) {
      const typeDefinition = await this.getTypeDefinition(typeName) || {};
      const { itemValidators } = typeDefinition;

      if (itemValidators instanceof Array) {
        const validationError = AsynchronousTypeValidator.createValidationError(
          AsynchronousTypeValidator.ERROR_TYPES.INVALID_ITEM
        );

        for (let i = 0; i < itemValidators.length; i++) {
          const validatorName = itemValidators[i];
          const validator = this.itemValidatorMap[validatorName];

          if (validator instanceof Function) {
            try {
              await validator(item, typeName, itemValidators);
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

  /**
   * @override
   * */
  async processItem (item, typeName) {
    // Mapped item validators.
    await this.validateItem(item, typeName);

    return super.processItem(item, typeName);
  }
}
