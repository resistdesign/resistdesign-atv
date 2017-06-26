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
    MISSING_REQUIRED_FIELD: 'MISSING_REQUIRED_FIELD'
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

  /**
   * @override
   * */
  async processValue (value, typeName, fieldName) {
    const validationFeature = await this.getFieldFeature(
        typeName,
        fieldName,
        AsynchronousTypeValidator.FEATURE_NAME
      ) || {};

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

    return super.processValue(value, typeName, fieldName);
  }
}
