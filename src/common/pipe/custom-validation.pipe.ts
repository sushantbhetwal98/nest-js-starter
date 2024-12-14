import {
  ValidationPipe,
  BadRequestException,
  ValidationError,
} from '@nestjs/common';

class CustomValidationPipe extends ValidationPipe {
  public createExceptionFactory() {
    return (validationErrors: ValidationError[] = []) => {
      const firstError = this.getFirstError(validationErrors);
      return new BadRequestException(firstError);
    };
  }

  private getFirstError(validationErrors: ValidationError[]): string {
    const error = this.flattenValidationErrors(validationErrors)[0];
    return error;
  }

  public flattenValidationErrors(
    validationErrors: ValidationError[],
    parentPath: string = '',
  ): string[] {
    return validationErrors
      .map((error) => {
        const propertyPath = parentPath
          ? `${parentPath}.${error.property}`
          : error.property;
        if (error.constraints) {
          return Object.values(error.constraints).map(
            (message) => `${propertyPath} ${message}`,
          );
        }
        if (error.children && error.children.length > 0) {
          return this.flattenValidationErrors(error.children, propertyPath);
        }
        return [];
      })
      .reduce((a, b) => a.concat(b), []);
  }
}

export { CustomValidationPipe };
