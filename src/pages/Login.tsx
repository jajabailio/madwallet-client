import { Box, Container, Paper, Typography, Link as MuiLink, Grid } from '@mui/material';
import Joi from 'joi';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import FormBuilder from '../components/form/FormBuilder';
import { useAuth } from '../contexts';

const loginSchema = Joi.object({
	email: Joi.string().email({ tlds: false }).required().label('email'),
	password: Joi.string().required().label('password'),
});

const Login = () => {
	const { login } = useAuth();
	const navigate = useNavigate();

	const handleSubmit = async (data: Record<string, unknown>) => {
		try {
			await login({
				email: data.email as string,
				password: data.password as string,
			});

			toast.success('Login successful!');
			navigate('/expenses');
		} catch (error) {
			// Error toast handled by httpService
			console.error('Login failed:', error);
		}
	};

	const {
		renderTextInput,
		renderButton,
		handleSubmit: formHandleSubmit,
	} = FormBuilder({
		schema: loginSchema,
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
						Sign in to your account
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
								name: 'password',
								label: 'Password',
								type: 'password',
								placeholder: '••••••••',
								required: true,
							})}

							<Grid size={12}>
								{renderButton({
									text: 'Sign In',
									variant: 'contained',
									fullWidth: true,
								})}
							</Grid>

							<Grid size={12}>
								<Typography variant="body2" align="center">
									Don't have an account?{' '}
									<MuiLink component={Link} to="/signup">
										Sign up
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

export default Login;
