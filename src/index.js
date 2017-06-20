import AsynchronousTypeProcessor from 'resistdesign-atp';

export default class AsynchronousTypeValidator
  extends AsynchronousTypeProcessor {
  static ERROR_MESSAGES = {
    MISSING_REQUIRED_FIELD: 'MISSING_REQUIRED_FIELD'
  };

  async processValue (value, typeName, fieldName) {
    const fieldDescriptor = this.getFieldDescriptor(typeName, fieldName);

    if (
      fieldDescriptor.features instanceof Object &&
      fieldDescriptor.features.valdation instanceof Object &&
      fieldDescriptor.features.validation.required &&
      (value === null || value === undefined)
    ) {
      throw new Error(
        AsynchronousTypeValidator.ERROR_MESSAGES.MISSING_REQUIRED_FIELD
      );
    }

    return super.processValue(value, typeName, fieldName);
  }
}
