'use client';
import {
  ChevronLeft,
  ChevronRight,
  Check,
  MapPin,
  User,
  Mail,
  Lock,
  Building2,
  Sparkles,
  Trash2,
  Plus,
} from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';

interface Location {
  id: string;
  name: string;
  address: string;
}

export default function OnboardingPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    organizationName: '',
    firstName: '',
    lastName: '',
  });
  const [locations, setLocations] = useState<Location[]>([{ id: '1', name: '', address: '' }]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const totalSteps = 3;

  const steps = [
    {
      id: 1,
      title: 'Your details',
      description: 'Tell us about your business',
      icon: User,
    },
    {
      id: 2,
      title: 'Add locations',
      description: 'Set up your gym locations',
      icon: MapPin,
    },
    {
      id: 3,
      title: 'Create account',
      description: 'Set up your login credentials',
      icon: Mail,
    },
  ];

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleLocationChange = (id: string, field: 'name' | 'address', value: string) => {
    setLocations(prev =>
      prev.map(location => (location.id === id ? { ...location, [field]: value } : location))
    );
    const errorKey = `location_${id}_${field}`;
    if (errors[errorKey]) {
      setErrors(prev => ({ ...prev, [errorKey]: '' }));
    }
  };

  const addLocation = () => {
    const newId = (locations.length + 1).toString();
    setLocations(prev => [...prev, { id: newId, name: '', address: '' }]);
  };

  const removeLocation = (id: string) => {
    if (locations.length > 1) {
      setLocations(prev => prev.filter(location => location.id !== id));
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[`location_${id}_name`];
        delete newErrors[`location_${id}_address`];
        return newErrors;
      });
    }
  };

  const validateCurrentStep = () => {
    const newErrors: Record<string, string> = {};

    if (currentStep === 1) {
      if (!formData.organizationName) newErrors.organizationName = 'Organization name is required';
      if (!formData.firstName) newErrors.firstName = 'First name is required';
      if (!formData.lastName) newErrors.lastName = 'Last name is required';
    } else if (currentStep === 2) {
      locations.forEach(location => {
        if (!location.name) newErrors[`location_${location.id}_name`] = 'Location name is required';
        if (!location.address)
          newErrors[`location_${location.id}_address`] = 'Location address is required';
      });
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (currentStep === 3) {
      handleSubmit();
      return;
    }

    if (validateCurrentStep()) {
      setCurrentStep(prev => Math.min(prev + 1, totalSteps));
    }
  };

  const handleBack = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async () => {
    setIsLoading(true);

    try {
      // Store onboarding data in session storage to persist after auth
      sessionStorage.setItem(
        'onboardingData',
        JSON.stringify({
          organizationName: formData.organizationName,
          firstName: formData.firstName,
          lastName: formData.lastName,
          locations,
        })
      );

      // Use AuthKit's user management authentication for sign up
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          firstName: formData.firstName,
          lastName: formData.lastName,
        }),
      });

      const data = await response.json();
      console.log('Sign up response:', data);

      if (response.ok && data.url) {
        console.log('Redirecting to WorkOS:', data.url);
        window.location.href = data.url;
      } else {
        setIsLoading(false);
        setErrors({ email: data.error || 'Failed to start authentication. Please try again.' });
      }
    } catch (error) {
      console.error('Auth error:', error);
      setIsLoading(false);
      setErrors({ email: 'Failed to start authentication. Please try again.' });
    }
  };

  const getStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className='space-y-6 animate-in fade-in duration-300'>
            <div className='max-w-2xl mx-auto'>
              <label className='block text-xs font-medium text-secondary-text mb-2 uppercase tracking-wide'>
                Organization Name
              </label>
              <input
                type='text'
                value={formData.organizationName}
                onChange={e => handleInputChange('organizationName', e.target.value)}
                className={`w-full px-4 py-3 rounded-xl border ${
                  errors.organizationName
                    ? 'border-danger focus:border-danger'
                    : 'border-border focus:border-primary'
                } focus:outline-none focus:ring-2 focus:ring-primary/10 transition-all bg-surface shadow-sm hover:shadow-md`}
                placeholder='FitPro Gym & Wellness'
              />
              {errors.organizationName ? <p className='mt-1 text-xs text-danger font-medium'>{errors.organizationName}</p> : null}
            </div>

            <div className='grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto'>
              <div>
                <label className='block text-xs font-medium text-secondary-text mb-2 uppercase tracking-wide'>
                  First Name
                </label>
                <input
                  type='text'
                  value={formData.firstName}
                  onChange={e => handleInputChange('firstName', e.target.value)}
                  className={`w-full px-4 py-3 rounded-xl border ${
                    errors.firstName
                      ? 'border-danger focus:border-danger'
                      : 'border-border focus:border-primary'
                  } focus:outline-none focus:ring-2 focus:ring-primary/10 transition-all bg-surface shadow-sm hover:shadow-md`}
                  placeholder='John'
                />
                {errors.firstName ? <p className='mt-1 text-xs text-danger font-medium'>{errors.firstName}</p> : null}
              </div>
              <div>
                <label className='block text-xs font-medium text-secondary-text mb-2 uppercase tracking-wide'>
                  Last Name
                </label>
                <input
                  type='text'
                  value={formData.lastName}
                  onChange={e => handleInputChange('lastName', e.target.value)}
                  className={`w-full px-4 py-3 rounded-xl border ${
                    errors.lastName
                      ? 'border-danger focus:border-danger'
                      : 'border-border focus:border-primary'
                  } focus:outline-none focus:ring-2 focus:ring-primary/10 transition-all bg-surface shadow-sm hover:shadow-md`}
                  placeholder='Doe'
                />
                {errors.lastName ? <p className='mt-1 text-xs text-danger font-medium'>{errors.lastName}</p> : null}
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className='space-y-6 animate-in fade-in duration-300'>
            <div className='max-h-[500px] overflow-y-auto pr-2 space-y-6'>
              {locations.map((location, index) => (
                <div
                  key={location.id}
                  className='bg-surface border border-border rounded-xl p-6 hover:shadow-md transition-all duration-200 hover:border-primary/30'
                >
                  <div className='flex items-center justify-between mb-6'>
                    <div className='flex items-center space-x-3'>
                      <div className='w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center'>
                        <Building2 className='w-4 h-4 text-primary' />
                      </div>
                      <h4 className='text-sm font-medium text-primary-text'>
                        Location {index + 1}
                      </h4>
                    </div>
                    {locations.length > 1 && (
                      <button
                        type='button'
                        onClick={() => removeLocation(location.id)}
                        className='text-danger hover:text-danger hover:bg-danger/10 p-2 rounded-lg transition-colors'
                      >
                        <Trash2 className='w-4 h-4' />
                      </button>
                    )}
                  </div>
                  <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                    <div>
                      <label className='block text-xs font-medium text-secondary-text mb-2 uppercase tracking-wide'>
                        Location Name
                      </label>
                      <input
                        type='text'
                        value={location.name}
                        onChange={e => handleLocationChange(location.id, 'name', e.target.value)}
                        className={`w-full px-4 py-3 rounded-xl border ${
                          errors[`location_${location.id}_name`]
                            ? 'border-danger focus:border-danger'
                            : 'border-border focus:border-primary'
                        } focus:outline-none focus:ring-2 focus:ring-primary/10 transition-all bg-surface shadow-sm hover:shadow-md`}
                        placeholder='Downtown Studio'
                      />
                      {errors[`location_${location.id}_name`] ? <p className='mt-1 text-xs text-danger font-medium'>
                          {errors[`location_${location.id}_name`]}
                        </p> : null}
                    </div>
                    <div>
                      <label className='block text-xs font-medium text-secondary-text mb-2 uppercase tracking-wide'>
                        Address
                      </label>
                      <input
                        type='text'
                        value={location.address}
                        onChange={e => handleLocationChange(location.id, 'address', e.target.value)}
                        className={`w-full px-4 py-3 rounded-xl border ${
                          errors[`location_${location.id}_address`]
                            ? 'border-danger focus:border-danger'
                            : 'border-border focus:border-primary'
                        } focus:outline-none focus:ring-2 focus:ring-primary/10 transition-all bg-surface shadow-sm hover:shadow-md`}
                        placeholder='123 Main St, City, State 12345'
                      />
                      {errors[`location_${location.id}_address`] ? <p className='mt-1 text-xs text-danger font-medium'>
                          {errors[`location_${location.id}_address`]}
                        </p> : null}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <button
              type='button'
              onClick={addLocation}
              className='w-full border-2 border-dashed border-border rounded-xl p-4 text-muted hover:border-primary hover:text-primary hover:bg-primary/5 transition-all flex items-center justify-center space-x-2 group'
            >
              <Plus className='w-4 h-4 group-hover:scale-110 transition-transform' />
              <span className='font-medium text-sm'>Add Another Location</span>
            </button>
          </div>
        );

      case 3:
        return (
          <div className='text-center space-y-8 animate-in fade-in duration-300'>
            <div className='relative'>
              <div className='w-64 h-40 bg-gradient-to-br from-primary via-primary-light to-primary-dark rounded-3xl mx-auto relative overflow-hidden'>
                <div className='absolute inset-0 bg-white/20 backdrop-blur-sm' />
                <div className='absolute -bottom-6 -right-6 w-32 h-32 bg-white/30 rounded-full blur-xl' />
                <div className='absolute -top-6 -left-6 w-24 h-24 bg-white/30 rounded-full blur-xl' />
                <div className='relative z-10 flex items-center justify-center h-full'>
                  <div className='w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-2xl'>
                    <Mail className='w-10 h-10 text-primary' />
                  </div>
                </div>
              </div>
            </div>

            <div className='space-y-4'>
              <h3 className='text-2xl font-bold text-primary-text'>
                Ready to Create Your Account!
              </h3>
              <p className='text-secondary-text max-w-md mx-auto'>
                Click continue to set up your account with WorkOS. You'll be able to sign in with
                your email and password.
              </p>
            </div>

            <div className='bg-surface-light rounded-xl p-6 max-w-md mx-auto'>
              <h4 className='text-sm font-semibold text-primary-text mb-4'>
                Your Business Summary:
              </h4>
              <div className='space-y-3 text-left'>
                <div className='flex justify-between'>
                  <span className='text-xs text-secondary-text'>Organization:</span>
                  <span className='text-xs text-primary-text font-medium'>
                    {formData.organizationName}
                  </span>
                </div>
                <div className='flex justify-between'>
                  <span className='text-xs text-secondary-text'>Owner:</span>
                  <span className='text-xs text-primary-text font-medium'>
                    {formData.firstName} {formData.lastName}
                  </span>
                </div>
                <div className='flex justify-between'>
                  <span className='text-xs text-secondary-text'>Locations:</span>
                  <span className='text-xs text-primary-text font-medium'>
                    {locations.length} location{locations.length > 1 ? 's' : ''}
                  </span>
                </div>
              </div>
            </div>

            <div className='bg-gradient-to-r from-primary/5 to-primary-light/5 rounded-xl p-4 border border-primary/10 max-w-md mx-auto'>
              <div className='flex items-start space-x-3'>
                <Lock className='w-4 h-4 text-primary mt-0.5' />
                <div className='text-xs text-secondary-text'>
                  <p className='font-medium mb-1'>Secure Authentication</p>
                  <p className='text-muted'>
                    You'll be redirected to WorkOS to create your account securely
                  </p>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className='min-h-screen bg-gradient-to-br from-surface via-surface-light to-accent flex'>
      {/* Left Sidebar */}
      <div className='hidden lg:flex lg:w-1/3 bg-gradient-to-br from-primary via-primary-dark to-accent relative overflow-hidden'>
        {/* Background Image */}
        <div className='absolute inset-0 flex items-center justify-center'>
          <Image
            src='/images/Onboard.png'
            alt='Onboarding Artwork'
            fill
            className='object-contain opacity-30'
          />
        </div>

        {/* Content Overlay */}
        <div className='relative z-10 flex flex-col justify-center h-full p-12 text-white'>
          {/* Header */}
          <div className='mb-12'>
            <div className='flex items-center space-x-3 mb-6'>
              <div className='w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center shadow-lg'>
                <Sparkles className='w-7 h-7 text-white' />
              </div>
              <h1 className='text-2xl font-bold text-white'>B2B Gym CRM</h1>
            </div>
            <div className='max-w-md'>
              <h2 className='text-display-2 font-display mb-4'>Get Started in Minutes</h2>
              <p className='text-body-lg opacity-90 leading-relaxed'>
                Set up your gym management system and start transforming your fitness business
                today. Just a few quick steps to get you up and running.
              </p>
            </div>
          </div>

          {/* Steps - Centered */}
          <div className='flex-1 flex items-center justify-center'>
            <div className='w-full max-w-sm space-y-8'>
              {steps.map((step, index) => {
                const Icon = step.icon;
                const isCompleted = step.id < currentStep;
                const isCurrent = step.id === currentStep;
                const isUpcoming = step.id > currentStep;

                return (
                  <div key={step.id} className='relative'>
                    <div className='flex items-start space-x-4'>
                      {/* Step Icon */}
                      <div
                        className={`
                        w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-300
                        ${isCompleted ? 'bg-white/20 text-white scale-100' : ''}
                        ${
                          isCurrent
                            ? 'bg-white/30 text-white shadow-lg shadow-white/20 scale-110'
                            : ''
                        }
                        ${isUpcoming ? 'bg-white/10 text-white/60 scale-100' : ''}
                      `}
                      >
                        {isCompleted ? (
                          <Check className='w-6 h-6' strokeWidth={3} />
                        ) : (
                          <Icon className='w-6 h-6' strokeWidth={isCurrent ? 2.5 : 2} />
                        )}
                      </div>

                      {/* Step Content */}
                      <div className='flex-1 pt-1'>
                        <h3
                          className={`
                          text-sm font-semibold transition-colors duration-300
                          ${
                            isCurrent
                              ? 'text-white'
                              : isCompleted
                                ? 'text-white/90'
                                : 'text-white/60'
                          }
                        `}
                        >
                          {step.title}
                        </h3>
                        <p
                          className={`
                          text-xs mt-1 transition-colors duration-300
                          ${
                            isCurrent
                              ? 'text-white/80'
                              : isCompleted
                                ? 'text-white/70'
                                : 'text-white/50'
                          }
                        `}
                        >
                          {step.description}
                        </p>
                      </div>
                    </div>

                    {/* Connecting Line */}
                    {index < steps.length - 1 && (
                      <div
                        className={`
                        absolute left-6 top-14 w-0.5 h-10 transition-all duration-500
                        ${step.id < currentStep ? 'bg-white/40' : 'bg-white/20'}
                      `}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Footer */}
          <div className='mt-12'>
            <button
              type='button'
              className='flex items-center text-sm text-white/70 hover:text-white transition-colors'
            >
              <ChevronLeft className='w-4 h-4 mr-2' />
              Back to sign in
            </button>
          </div>
        </div>
      </div>

      {/* Right Content Area */}
      <div className='flex-1 flex items-center justify-center p-8 overflow-y-auto'>
        <div className='w-full max-w-4xl h-full flex flex-col justify-center'>
          <div className='w-full mx-auto'>
            {/* Step Header */}
            <div className='mb-6 text-center'>
              <div className='inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-primary/10 to-primary-light/10 rounded-xl mb-3'>
                {React.createElement(steps[currentStep - 1]?.icon || User, {
                  className: 'w-6 h-6 text-primary',
                })}
              </div>
              <h2 className='text-2xl font-semibold text-primary-text mb-1'>
                {steps[currentStep - 1]?.title}
              </h2>
              <p className='text-sm text-secondary-text'>{steps[currentStep - 1]?.description}</p>
            </div>

            {/* Form Content */}
            <div className='bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border-0 p-12'>
              {getStepContent()}
            </div>

            {/* Navigation */}
            <div className='mt-8 flex items-center justify-between'>
              <button
                type='button'
                onClick={handleBack}
                disabled={currentStep === 1}
                className={`
                  flex items-center space-x-2 px-6 py-3 rounded-xl font-medium transition-all
                  ${
                    currentStep === 1
                      ? 'invisible'
                      : 'text-muted hover:text-secondary-text hover:bg-accent'
                  }
                `}
              >
                <ChevronLeft className='w-5 h-5' />
                <span>Back</span>
              </button>

              {/* Progress Dots */}
              <div className='flex items-center space-x-2'>
                {Array.from({ length: totalSteps }, (_, i) => (
                  <div
                    key={i}
                    className={`
                      transition-all duration-300
                      ${
                        i < currentStep - 1
                          ? 'w-2 h-2 bg-success rounded-full'
                          : i === currentStep - 1
                            ? 'w-8 h-2 bg-primary rounded-full'
                            : 'w-2 h-2 bg-border rounded-full'
                      }
                    `}
                  />
                ))}
              </div>

              <button
                type='button'
                onClick={handleNext}
                disabled={isLoading}
                className={`
                  flex items-center space-x-2 px-6 py-3 rounded-xl font-medium transition-all
                  ${
                    currentStep === 3
                      ? 'bg-gradient-to-r from-success to-success text-white hover:from-success hover:to-success shadow-lg shadow-success/25'
                      : 'bg-gradient-to-r from-primary to-primary-dark text-white hover:from-primary-dark hover:to-primary shadow-lg shadow-primary/25'
                  }
                  ${isLoading ? 'opacity-75 cursor-not-allowed' : ''}
                `}
              >
                <span>
                  {currentStep === 3
                    ? isLoading
                      ? 'Redirecting to WorkOS...'
                      : 'Create Account'
                    : 'Continue'}
                </span>
                {!isLoading && <ChevronRight className='w-5 h-5' />}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
