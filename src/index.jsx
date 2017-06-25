import AsynchronousTypeProcessor from 'resistdesign-atp';

export default class AsynchronousTypeValidator
  extends AsynchronousTypeProcessor {
  static ERROR_MESSAGES = {
    MISSING_REQUIRED_FIELD: 'MISSING_REQUIRED_FIELD'
  };
  static FEATURE_NAME = 'validation';
  static INVALID_REQUIRED_VALUES = [null, undefined];

  /**
   * @override
   * */
  async processValue (value, typeName, fieldName) {
    const validationFeature = await this.getFieldFeature(
        typeName,
        fieldName,
        AsynchronousTypeValidator.FEATURE_NAME
      ) || {};
    const { required } = validationFeature;

    if (
      required &&
      AsynchronousTypeValidator.INVALID_REQUIRED_VALUES.indexOf(value) !== -1
    ) {
      throw new Error(
        AsynchronousTypeValidator.ERROR_MESSAGES.MISSING_REQUIRED_FIELD
      );
    }

    return super.processValue(value, typeName, fieldName);
  }
}
