import {
  Button,
  type ButtonProps,
  Checkbox,
  FormControl,
  FormControlLabel,
  FormHelperText,
  Grid,
  type GridProps,
  InputLabel,
  MenuItem,
  Radio,
  RadioGroup,
  Select,
  TextField,
  type TextFieldProps,
  Typography,
} from '@mui/material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import type Joi from 'joi';
import { useCallback, useState } from 'react';

interface FormBuilderProps {
  schema?: Joi.ObjectSchema;
  onSubmit?: (data: Record<string, unknown>) => void | Promise<void>;
}

interface RenderInputProps {
  name: string;
  placeholder?: string;
  label?: string;
  type?: string;
  required?: boolean;
  defaultValue?: string | number | boolean;
  rows?: number;
  options?: { value: string | number; label: string }[];
  textFieldProps?: Partial<TextFieldProps>;
  gridProps?: GridProps;
}

const FormBuilder = ({ schema, onSubmit }: FormBuilderProps) => {
  const [data, setData] = useState<Record<string, unknown>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [generalError, setGeneralError] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Validate a single field using Joi schema
  const validateFieldWithJoi = (name: string, value: unknown): string | undefined => {
    if (!schema) return undefined;

    try {
      const { error } = schema.extract(name).validate(value);
      return error ? error.details[0].message : undefined;
    } catch {
      return undefined;
    }
  };

  // Validate all fields using Joi schema
  const validateFormWithJoi = (): boolean => {
    if (!schema) return true;

    const { error } = schema.validate(data, { abortEarly: false });

    if (error) {
      console.log('[FormBuilder] Joi validation error:', error);
      console.log('[FormBuilder] Error details:', error.details);

      const newErrors: Record<string, string> = {};
      let formError = '';

      for (const detail of error.details) {
        console.log('[FormBuilder] Processing error detail:', detail);

        // If error has a field path, add to field errors
        if (detail.path && detail.path.length > 0) {
          const fieldName = detail.path[0] as string;
          newErrors[fieldName] = detail.message;
        } else {
          // If no field path, it's a general form error
          formError = detail.message;
        }
      }

      console.log('[FormBuilder] New errors to set:', newErrors);
      console.log('[FormBuilder] General form error:', formError);

      setErrors(newErrors);
      setGeneralError(formError);
      return false;
    }

    setErrors({});
    setGeneralError('');
    return true;
  };

  // Handle input change
  const handleChange = (name: string, value: unknown) => {
    setData((prev) => ({ ...prev, [name]: value }));

    // Clear error for this field if it exists
    if (errors[name]) {
      setErrors((prev) => {
        const updated = { ...prev };
        delete updated[name];
        return updated;
      });
    }

    // Clear general error when any field changes
    if (generalError) {
      setGeneralError('');
    }
  };

  // Handle blur event for real-time validation
  const handleBlur = (name: string) => {
    const error = validateFieldWithJoi(name, data[name]);
    if (error) {
      setErrors((prev) => ({ ...prev, [name]: error }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('[FormBuilder] Form submitted');
    console.log('[FormBuilder] Current form data:', data);

    const isValid = validateFormWithJoi();
    console.log('[FormBuilder] Validation result:', isValid);

    if (!isValid) {
      console.log('[FormBuilder] Validation errors:', errors);
      return;
    }

    if (onSubmit) {
      console.log('[FormBuilder] Calling onSubmit handler');
      setIsSubmitting(true);
      try {
        await onSubmit(data);
        console.log('[FormBuilder] onSubmit completed successfully');
      } catch (error) {
        console.error('[FormBuilder] onSubmit error:', error);
      } finally {
        setIsSubmitting(false);
      }
    } else {
      console.log('[FormBuilder] No onSubmit handler provided');
    }
  };

  const renderTextInput = ({
    name,
    placeholder,
    label,
    type = 'text',
    required = false,
    defaultValue,
    textFieldProps = {},
    gridProps = {},
  }: RenderInputProps) => {
    // Set default value if provided and not already set
    if (defaultValue !== undefined && data[name] === undefined) {
      setData((prev) => ({ ...prev, [name]: defaultValue }));
    }

    return (
      <Grid size={12} {...gridProps}>
        <TextField
          fullWidth
          label={label}
          name={name}
          type={type}
          placeholder={placeholder}
          value={data[name] ?? ''}
          onChange={(e) => handleChange(name, e.target.value)}
          onBlur={() => handleBlur(name)}
          error={!!errors[name]}
          helperText={errors[name]}
          required={required}
          disabled={isSubmitting}
          {...textFieldProps}
        />
      </Grid>
    );
  };

  // Render textarea
  const renderTextArea = ({
    name,
    placeholder,
    label,
    required = false,
    defaultValue,
    rows = 4,
    textFieldProps = {},
    gridProps = {},
  }: RenderInputProps) => {
    if (defaultValue !== undefined && data[name] === undefined) {
      setData((prev) => ({ ...prev, [name]: defaultValue }));
    }

    return (
      <Grid size={12} {...gridProps}>
        <TextField
          fullWidth
          multiline
          rows={rows}
          label={label}
          name={name}
          placeholder={placeholder}
          value={data[name] ?? ''}
          onChange={(e) => handleChange(name, e.target.value)}
          onBlur={() => handleBlur(name)}
          error={!!errors[name]}
          helperText={errors[name]}
          required={required}
          disabled={isSubmitting}
          {...textFieldProps}
        />
      </Grid>
    );
  };

  // Render select dropdown
  const renderSelect = ({
    name,
    label,
    required = false,
    defaultValue,
    options = [],
    gridProps = {},
  }: RenderInputProps) => {
    if (defaultValue !== undefined && data[name] === undefined) {
      setData((prev) => ({ ...prev, [name]: defaultValue }));
    }

    return (
      <Grid size={12} {...gridProps}>
        <FormControl fullWidth error={!!errors[name]}>
          <InputLabel required={required}>{label}</InputLabel>
          <Select
            name={name}
            value={data[name] ?? ''}
            onChange={(e) => handleChange(name, e.target.value)}
            onBlur={() => handleBlur(name)}
            label={label}
            disabled={isSubmitting}
          >
            {options.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </Select>
          {errors[name] && <FormHelperText>{errors[name]}</FormHelperText>}
        </FormControl>
      </Grid>
    );
  };

  // Render checkbox
  const renderCheckbox = ({
    name,
    label,
    defaultValue = false,
    gridProps = {},
  }: RenderInputProps) => {
    if (defaultValue !== undefined && data[name] === undefined) {
      setData((prev) => ({ ...prev, [name]: defaultValue }));
    }

    return (
      <Grid size={12} {...gridProps}>
        <FormControl error={!!errors[name]}>
          <FormControlLabel
            control={
              <Checkbox
                name={name}
                checked={!!data[name]}
                onChange={(e) => handleChange(name, e.target.checked)}
                onBlur={() => handleBlur(name)}
                disabled={isSubmitting}
              />
            }
            label={label}
          />
          {errors[name] && <FormHelperText>{errors[name]}</FormHelperText>}
        </FormControl>
      </Grid>
    );
  };

  // Render radio group
  const renderRadio = ({
    name,
    label,
    required = false,
    defaultValue,
    options = [],
    gridProps = {},
  }: RenderInputProps) => {
    if (defaultValue !== undefined && data[name] === undefined) {
      setData((prev) => ({ ...prev, [name]: defaultValue }));
    }

    return (
      <Grid size={12} {...gridProps}>
        <FormControl error={!!errors[name]} fullWidth>
          <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
            {label}
            {required && ' *'}
          </Typography>
          <RadioGroup
            name={name}
            value={data[name] ?? ''}
            onChange={(e) => handleChange(name, e.target.value)}
            onBlur={() => handleBlur(name)}
          >
            {options.map((option) => (
              <FormControlLabel
                key={option.value}
                value={option.value}
                control={<Radio />}
                label={option.label}
                disabled={isSubmitting}
              />
            ))}
          </RadioGroup>
          {errors[name] && <FormHelperText>{errors[name]}</FormHelperText>}
        </FormControl>
      </Grid>
    );
  };

  // Render date picker
  const renderDatePicker = ({
    name,
    label,
    required = false,
    defaultValue,
    gridProps = {},
  }: RenderInputProps) => {
    if (defaultValue !== undefined && data[name] === undefined) {
      setData((prev) => ({ ...prev, [name]: defaultValue }));
    }

    return (
      <Grid size={12} {...gridProps}>
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <DatePicker
            label={label}
            value={data[name] ? new Date(data[name] as string) : null}
            onChange={(newValue) => {
              handleChange(name, newValue);
            }}
            slotProps={{
              textField: {
                fullWidth: true,
                required,
                error: !!errors[name],
                helperText: errors[name],
                onBlur: () => handleBlur(name),
                disabled: isSubmitting,
              },
            }}
          />
        </LocalizationProvider>
      </Grid>
    );
  };

  const renderButton = ({ text, type = 'submit', ...props }: { text: string } & ButtonProps) => {
    return (
      <Button type={type} disabled={isSubmitting} {...props}>
        {text}
      </Button>
    );
  };

  const setValue = useCallback((name: string, value: unknown) => {
    setData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => {
      const updated = { ...prev };
      delete updated[name];
      return updated;
    });
  }, []);

  const reset = useCallback(() => {
    setData({});
    setErrors({});
    setGeneralError('');
  }, []);

  return {
    renderTextInput,
    renderTextArea,
    renderSelect,
    renderCheckbox,
    renderRadio,
    renderDatePicker,
    handleSubmit,
    renderButton,
    setValue,
    reset,
    data,
    errors,
    generalError,
    isSubmitting,
  };
};

export default FormBuilder;
