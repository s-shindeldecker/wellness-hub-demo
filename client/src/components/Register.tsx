import React, { useState } from 'react';
import { 
  Form, 
  FormGroup, 
  Label, 
  Input, 
  Select,
  Checkbox,
  Button, 
  ErrorMessage 
} from '../styles';
import { registerUser } from '../services/api';

interface RegisterProps {
  onRegister: () => void;
  onClose: () => void;
}

const Register: React.FC<RegisterProps> = ({ onRegister, onClose }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [interests, setInterests] = useState<string[]>([]);
  const [preferredTimes, setPreferredTimes] = useState<string[]>([]);
  const [notifications, setNotifications] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const interestOptions = [
    'Yoga', 'Meditation', 'Massage', 'Personal Training', 
    'Group Fitness', 'Nutrition', 'Aromatherapy', 'Facials'
  ];

  const timeOptions = [
    { value: 'morning', label: 'Morning (6am - 12pm)' },
    { value: 'afternoon', label: 'Afternoon (12pm - 5pm)' },
    { value: 'evening', label: 'Evening (5pm - 10pm)' }
  ];

  const handleInterestChange = (interest: string) => {
    if (interests.includes(interest)) {
      setInterests(interests.filter(i => i !== interest));
    } else {
      setInterests([...interests, interest]);
    }
  };

  const handleTimeChange = (time: string) => {
    if (preferredTimes.includes(time)) {
      setPreferredTimes(preferredTimes.filter(t => t !== time));
    } else {
      setPreferredTimes([...preferredTimes, time]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      setError('Please enter your name');
      return;
    }
    
    if (!email.trim()) {
      setError('Please enter your email address');
      return;
    }
    
    if (interests.length === 0) {
      setError('Please select at least one interest');
      return;
    }
    
    if (preferredTimes.length === 0) {
      setError('Please select at least one preferred time');
      return;
    }
    
    try {
      setIsSubmitting(true);
      await registerUser(name, email, interests, preferredTimes, notifications);
      onRegister();
    } catch (err) {
      setError('Registration failed. Please try again later.');
      console.error('Error registering user:', err);
    } finally {
      setIsSubmitting(false);
    }
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
        maxWidth: '600px',
        position: 'relative',
        maxHeight: '90vh',
        overflowY: 'auto'
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
        
        <h2 style={{ marginBottom: '1.5rem' }}>Create Your Account</h2>
        
        <Form onSubmit={handleSubmit}>
          {error && <ErrorMessage>{error}</ErrorMessage>}
          
          <FormGroup>
            <Label htmlFor="name">Full Name</Label>
            <Input 
              type="text" 
              id="name" 
              value={name} 
              onChange={(e) => setName(e.target.value)} 
              placeholder="Enter your full name"
            />
          </FormGroup>
          
          <FormGroup>
            <Label htmlFor="email">Email</Label>
            <Input 
              type="email" 
              id="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              placeholder="Enter your email"
            />
          </FormGroup>
          
          <FormGroup>
            <Label>Interests (select all that apply)</Label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
              {interestOptions.map(interest => (
                <div key={interest} style={{ display: 'flex', alignItems: 'center' }}>
                  <Checkbox 
                    id={`interest-${interest}`}
                    checked={interests.includes(interest)}
                    onChange={() => handleInterestChange(interest)}
                  />
                  <label htmlFor={`interest-${interest}`}>{interest}</label>
                </div>
              ))}
            </div>
          </FormGroup>
          
          <FormGroup>
            <Label>Preferred Times</Label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {timeOptions.map(option => (
                <div key={option.value} style={{ display: 'flex', alignItems: 'center' }}>
                  <Checkbox 
                    id={`time-${option.value}`}
                    checked={preferredTimes.includes(option.value)}
                    onChange={() => handleTimeChange(option.value)}
                  />
                  <label htmlFor={`time-${option.value}`}>{option.label}</label>
                </div>
              ))}
            </div>
          </FormGroup>
          
          <FormGroup>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <Checkbox 
                id="notifications"
                checked={notifications}
                onChange={() => setNotifications(!notifications)}
              />
              <label htmlFor="notifications">
                Receive email notifications about new classes and promotions
              </label>
            </div>
          </FormGroup>
          
          <Button 
            type="submit" 
            style={{ width: '100%', marginTop: '1rem' }}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Creating Account...' : 'Create Account'}
          </Button>
        </Form>
        
        <div style={{ marginTop: '1rem', fontSize: '0.8rem', color: '#666', textAlign: 'center' }}>
          <p>By creating an account, you agree to our Terms of Service and Privacy Policy.</p>
        </div>
      </div>
    </div>
  );
};

export default Register;
