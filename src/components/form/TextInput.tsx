import { Grid, type GridProps, OutlinedInput, type OutlinedInputProps } from '@mui/material';

export type TTextInputProps = {
  name: string;
  placeholder?: string;
  type?: string;
  inputProps?: OutlinedInputProps;
  gridProps?: GridProps;
};

const TextInput = ({
  name,
  placeholder,
  type,
  inputProps = {},
  gridProps = {},
}: TTextInputProps) => (
  <Grid size={12} mb={2} {...gridProps}>
    <OutlinedInput
      name={name}
      type={type}
      placeholder={placeholder}
      sx={{ width: '100%' }}
      {...inputProps}
    />
  </Grid>
);

export default TextInput;
