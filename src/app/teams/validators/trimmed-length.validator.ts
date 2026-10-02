import {
  AbstractControl,
  ValidationErrors,
  ValidatorFn,
} from '@angular/forms';

export function trimmedLengthValidator(
  minLength: number,
  maxLength: number,
): ValidatorFn {
  return (
    control: AbstractControl<string>,
  ): ValidationErrors | null => {
    const value = control.value.trim();

    if (value.length === 0) {
      return { required: true };
    }

    if (value.length < minLength) {
      return {
        minlength: {
          requiredLength: minLength,
          actualLength: value.length,
        },
      };
    }

    if (value.length > maxLength) {
      return {
        maxlength: {
          requiredLength: maxLength,
          actualLength: value.length,
        },
      };
    }

    return null;
  };
}
