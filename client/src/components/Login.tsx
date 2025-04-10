import React, { useState } from 'react';
import { 
  Form, 
  FormGroup, 
  Label, 
  Input, 
  Button, 
  ErrorMessage 
} from '../styles';

interface LoginProps {
  onLogin: (username: string, password: string) => void;
  onClose: () => void;
  onRegister: () => void;
}

const Login: React.FC<LoginProps> = ({ onLogin, onClose, onRegister }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username.trim()) {
      setError('Please enter your email address');
      return;
    }
    
    if (!password.trim()) {
      setError('Please enter your password');
      return;
    }
    
    // For demo purposes, we don't validate the password
    onLogin(username, password);
  };

  return (
    <div className="modal-overlay" style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000
    }}>
      <div className="modal-content" style={{
        backgroundColor: 'white',
        padding: '2rem',
        borderRadius: '8px',
        width: '100%',
        maxWidth: '500px',
        position: 'relative'
      }}>
        <button 
          className="close-button" 
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '1rem',
            right: '1rem',
            background: 'none',
            border: 'none',
            fontSize: '1.5rem',
            cursor: 'pointer'
          }}
        >
          &times;
        </button>
        
        <h2 style={{ marginBottom: '1.5rem' }}>Log In to Your Account</h2>
        
        <Form onSubmit={handleSubmit}>
          {error && <ErrorMessage>{error}</ErrorMessage>}
          
          <FormGroup>
            <Label htmlFor="username">Email</Label>
            <Input 
              type="email" 
              id="username" 
              value={username} 
              onChange={(e) => setUsername(e.target.value)} 
              placeholder="Enter your email"
            />
          </FormGroup>
          
          <FormGroup>
            <Label htmlFor="password">Password</Label>
            <Input 
              type="password" 
              id="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              placeholder="Enter your password"
            />
          </FormGroup>
          
          <Button type="submit" style={{ width: '100%', marginTop: '1rem' }}>
            Log In
          </Button>
        </Form>
        
        <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
          <p>Don't have an account?</p>
          <button 
            onClick={onRegister}
            style={{
              background: 'none',
              border: 'none',
              color: '#0080ff',
              cursor: 'pointer',
              textDecoration: 'underline',
              padding: 0,
              fontSize: '1rem'
            }}
          >
            Create an account
          </button>
        </div>
        
        <div style={{ marginTop: '1rem', fontSize: '0.8rem', color: '#666', textAlign: 'center' }}>
          <p>For demo purposes, any email and password will work.</p>
          <p>Try: jamie@example.com / password123</p>
        </div>
      </div>
    </div>
  );
};

export default Login;
