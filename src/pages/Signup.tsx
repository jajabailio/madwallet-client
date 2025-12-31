import { Box, Container, Paper, Typography, Link as MuiLink, Grid } from '@mui/material';
import Joi from 'joi';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import FormBuilder from '../components/form/FormBuilder';
import { useAuth } from '../contexts';

const signupSchema = Joi.object({
	email: Joi.string().email({ tlds: false }).required().label('email'),
	password: Joi.string().min(8).required().label('password'),
	confirmPassword: Joi.string()
		.valid(Joi.ref('password'))
		.required()
		.label('confirm password')
		.messages({
			'any.only': 'Passwords must match',
		}),
	firstName: Joi.string().required().label('first name'),
	lastName: Joi.string().required().label('last name'),
});

const Signup = () => {
	const { signup } = useAuth();
	const navigate = useNavigate();

	const handleSubmit = async (data: Record<string, unknown>) => {
		try {
			await signup({
				email: data.email as string,
				password: data.password as string,
				firstName: data.firstName as string,
				lastName: data.lastName as string,
			});

			toast.success('Account created successfully!');
			navigate('/expenses');
		} catch (error) {
			// Error toast handled by httpService
			console.error('Signup failed:', error);
		}
	};

	const {
		renderTextInput,
		renderButton,
		handleSubmit: formHandleSubmit,
	} = FormBuilder({
		schema: signupSchema,
		onSubmit: handleSubmit,
	});

	return (
		<Box
			sx={{
				minHeight: '100vh',
				display: 'flex',
				alignItems: 'center',
				bgcolor: '#f5f5f5',
			}}
		>
			<Container maxWidth="sm">
				<Paper elevation={3} sx={{ p: 4 }}>
					<Typography variant="h4" component="h1" sx={{ mb: 1, fontWeight: 'bold' }}>
						Mad Wallet
					</Typography>
					<Typography variant="body2" color="textSecondary" sx={{ mb: 4 }}>
						Create your account
					</Typography>

					<form onSubmit={formHandleSubmit}>
						<Grid container spacing={2}>
							{renderTextInput({
								name: 'email',
								label: 'Email',
								type: 'email',
								placeholder: 'you@example.com',
								required: true,
							})}

							{renderTextInput({
								name: 'firstName',
								label: 'First Name',
								placeholder: 'John',
								required: true,
							})}

							{renderTextInput({
								name: 'lastName',
								label: 'Last Name',
								placeholder: 'Doe',
								required: true,
							})}

							{renderTextInput({
								name: 'password',
								label: 'Password',
								type: 'password',
								placeholder: '••••••••',
								required: true,
							})}

							{renderTextInput({
								name: 'confirmPassword',
								label: 'Confirm Password',
								type: 'password',
								placeholder: '••••••••',
								required: true,
							})}

							<Grid size={12}>
								{renderButton({
									text: 'Create Account',
									variant: 'contained',
									fullWidth: true,
								})}
							</Grid>

							<Grid size={12}>
								<Typography variant="body2" align="center">
									Already have an account?{' '}
									<MuiLink component={Link} to="/login">
										Sign in
									</MuiLink>
								</Typography>
							</Grid>
						</Grid>
					</form>
				</Paper>
			</Container>
		</Box>
	);
};

export default Signup;
