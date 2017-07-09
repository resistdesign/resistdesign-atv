/**
 * https://resistdesign.github.io/resistdesign-atp
 * */
import AbstractTypeProcessor from 'resistdesign-atp';

/**
 * @function
 * @param {Object} value The value to be validated.
 * @param {Array.<string>} typeValidationConfig The validation feature
 * configuration for the type.
 * @param {string} typeName The name of the type.
 * @throws {*} An error structure when the item is invalid.
 * */
async function TypeValidationFunction (value, typeValidationConfig, typeName) {
}

/**
 * @function
 * @param {string} value The value to be validated.
 * @param {Array.<string>} config The configuration value for the specific
 * validation feature property.
 * @param {string} typeName The name of the type.
 * @param {string} fieldName The name of the field.
 * @throws {*} An error structure when the value is invalid.
 * */
async function FieldValidationFunction (value, config, typeName, fieldName) {
}

/**
 * @class AsynchronousTypeValidator
 * Validate data of a given type contained within the type map.
 * */
export default class AsynchronousTypeValidator
  extends AbstractTypeProcessor {
  static ERROR_MESSAGES = {
    VALIDATION_ERROR: 'VALIDATION_ERROR',
    MISSING_REQUIRED_FIELD: 'MISSING_REQUIRED_FIELD',
    INCORRECT_NUMBER_OF_VALUES: 'INCORRECT_NUMBER_OF_VALUES',
    LESS_THAN_MINIMUM_NUMBER_OF_VALUES: 'LESS_THAN_MINIMUM_NUMBER_OF_VALUES',
    GREATER_THAN_MAXIMUM_NUMBER_OF_VALUES: 'GREATER_THAN_MAXIMUM_NUMBER_OF_VALUES'
  };
  static FEATURE_NAME = 'validation';
  static INVALID_REQUIRED_VALUES = [null, undefined];
  static DEFAULT_FIELD_FEATURE_VALIDATOR_MAP = {
    required: async (value, config) => {
      if (
        config &&
        AsynchronousTypeValidator.INVALID_REQUIRED_VALUES.indexOf(value) !== -1
      ) {
        throw new TypeError(
          AsynchronousTypeValidator.ERROR_MESSAGES.MISSING_REQUIRED_FIELD
        );
      }
    },
    requiredLength: async (value, config) => {
      if (
        typeof config === 'number' &&
        (
          !(value instanceof Array) ||
          value.length !== config
        )
      ) {
        const error = new TypeError(
          AsynchronousTypeValidator.ERROR_MESSAGES.INCORRECT_NUMBER_OF_VALUES
        );
        error.data = config;

        throw error;
      }
    },
    requiredLengthMin: async (value, config) => {
      if (
        typeof config === 'number' &&
        (
          !(value instanceof Array) ||
          value.length < config
        )
      ) {
        const error = new TypeError(
          AsynchronousTypeValidator
            .ERROR_MESSAGES.LESS_THAN_MINIMUM_NUMBER_OF_VALUES
        );
        error.data = config;

        throw error;
      }
    },
    requiredLengthMax: async (value, config) => {
      if (
        typeof config === 'number' &&
        value instanceof Array &&
        value.length > config
      ) {
        const error = new TypeError(
          AsynchronousTypeValidator
            .ERROR_MESSAGES.GREATER_THAN_MAXIMUM_NUMBER_OF_VALUES
        );
        error.data = config;

        throw error;
      }
    }
  };

  /**
   * A map of item validation functions.
   * @member {Object.<string, TypeValidationFunction>}
   * */
  typeValidatorMap;

  /**
   * A map of value validation functions.
   * @member {Object.<string, FieldValidationFunction>}
   * */
  fieldFeatureValidatorMap;

  constructor (config) {
    super(config);

    // Set the default `fieldFeatureValidatorMap` if one is not set.
    this.fieldFeatureValidatorMap =
      this.fieldFeatureValidatorMap instanceof Object ?
        this.fieldFeatureValidatorMap :
        AsynchronousTypeValidator.DEFAULT_FIELD_FEATURE_VALIDATOR_MAP;
  }

  /**
   * @override
   * */
  async processValue (value, typeName) {
    if (
      AsynchronousTypeValidator.valueExists(value) &&
      this.typeValidatorMap instanceof Object
    ) {
      // Type level validation
      const typeValidator = this.typeValidatorMap[typeName];

      if (typeValidator instanceof Function) {
        const typeValidationFeatureConfig = await this.getTypeFeature(
          typeName,
          AsynchronousTypeValidator.FEATURE_NAME
        );

        await typeValidator(value, typeValidationFeatureConfig, typeName);
      }
    }

    return super.processValue(value, typeName);
  }

  /**
   * @override
   * */
  async processFieldValue (value, typeName, fieldName) {
    if (this.fieldFeatureValidatorMap instanceof Object) {
      // Field level feature validations.
      const fieldValidationFeatureConfig = await this.getFieldFeature(
          typeName,
          fieldName,
          AsynchronousTypeValidator.FEATURE_NAME
        ) || {};

      for (const k in fieldValidationFeatureConfig) {
        if (
          fieldValidationFeatureConfig.hasOwnProperty(k) &&
          this.fieldFeatureValidatorMap.hasOwnProperty(k)
        ) {
          const fieldFeatureValidator = this.fieldFeatureValidatorMap[k];

          if (fieldFeatureValidator instanceof Function) {
            const featurePropertyConfig = fieldValidationFeatureConfig[k];

            await fieldFeatureValidator(
              value,
              featurePropertyConfig,
              typeName,
              fieldName
            );
          }
        }
      }
    }

    return super.processFieldValue(value, typeName, fieldName);
  }
}
