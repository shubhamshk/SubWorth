'use client';

import { useState, useEffect } from 'react';
import { User, Calendar } from 'lucide-react';
import { useStore } from '@/lib/store';

export default function StepIdentity() {
    const { profile, setProfile } = useStore();
    const [name, setName] = useState(profile.userName || '');
    const [age, setAge] = useState(profile.userAge?.toString() || '');
    const [errors, setErrors] = useState({ name: '', age: '' });

    // Update store when values change
    useEffect(() => {
        const ageNum = age ? parseInt(age, 10) : null;
        setProfile({
            userName: name.trim() || null,
            userAge: ageNum
        });
    }, [name, age, setProfile]);

    // Validate inputs
    const validateName = (value: string) => {
        if (!value.trim()) {
            return 'Please enter your name';
        }
        if (value.trim().length < 2) {
            return 'Name must be at least 2 characters';
        }
        return '';
    };

    const validateAge = (value: string) => {
        if (!value) {
            return 'Please enter your age';
        }
        const ageNum = parseInt(value, 10);
        if (isNaN(ageNum)) {
            return 'Please enter a valid number';
        }
        if (ageNum < 13) {
            return 'You must be at least 13 years old';
        }
        if (ageNum > 120) {
            return 'Please enter a valid age';
        }
        return '';
    };

    const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setName(value);
        setErrors(prev => ({ ...prev, name: '' }));
    };

    const handleAgeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        // Only allow numbers
        if (value === '' || /^\d+$/.test(value)) {
            setAge(value);
            setErrors(prev => ({ ...prev, age: '' }));
        }
    };

    const handleNameBlur = () => {
        const error = validateName(name);
        setErrors(prev => ({ ...prev, name: error }));
    };

    const handleAgeBlur = () => {
        const error = validateAge(age);
        setErrors(prev => ({ ...prev, age: error }));
    };

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="text-center space-y-3">
                <h2 className="text-3xl md:text-4xl font-bold">
                    Let's get to know you
                </h2>
                <p className="text-foreground-muted text-lg">
                    We'll use this to personalize your experience
                </p>
            </div>

            {/* Form */}
            <div className="space-y-6 max-w-md mx-auto">
                {/* Name Input */}
                <div className="space-y-2">
                    <label htmlFor="user-name" className="block text-sm font-medium text-foreground-muted">
                        What should we call you?
                    </label>
                    <div className="relative">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-foreground-muted">
                            <User className="w-5 h-5" />
                        </div>
                        <input
                            id="user-name"
                            type="text"
                            value={name}
                            onChange={handleNameChange}
                            onBlur={handleNameBlur}
                            placeholder="Enter your name"
                            style={{ color: '#000000' }}
                            className={`
                                w-full pl-12 pr-4 py-4 rounded-xl
                                bg-background/50 border-2 
                                ${errors.name
                                    ? 'border-red-500/50 focus:border-red-500'
                                    : 'border-white/10 focus:border-primary'
                                }
                                placeholder:text-foreground-muted/50
                                outline-none transition-all duration-200
                                focus:bg-background/70
                            `}
                            autoComplete="given-name"
                            maxLength={50}
                        />
                    </div>
                    {errors.name && (
                        <p className="text-sm text-red-400 ml-1">{errors.name}</p>
                    )}
                </div>

                {/* Age Input */}
                <div className="space-y-2">
                    <label htmlFor="user-age" className="block text-sm font-medium text-foreground-muted">
                        How old are you?
                    </label>
                    <div className="relative">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-foreground-muted">
                            <Calendar className="w-5 h-5" />
                        </div>
                        <input
                            id="user-age"
                            type="text"
                            inputMode="numeric"
                            value={age}
                            onChange={handleAgeChange}
                            onBlur={handleAgeBlur}
                            placeholder="Enter your age"
                            style={{ color: '#000000' }}
                            className={`
                                w-full pl-12 pr-4 py-4 rounded-xl
                                bg-background/50 border-2 
                                ${errors.age
                                    ? 'border-red-500/50 focus:border-red-500'
                                    : 'border-white/10 focus:border-primary'
                                }
                                placeholder:text-foreground-muted/50
                                outline-none transition-all duration-200
                                focus:bg-background/70
                            `}
                            maxLength={3}
                        />
                    </div>
                    {errors.age && (
                        <p className="text-sm text-red-400 ml-1">{errors.age}</p>
                    )}
                    <p className="text-xs text-foreground-muted/70 ml-1">
                        This helps us adjust our tone and recommendations
                    </p>
                </div>

                {/* Privacy Note */}
                <div className="pt-4 px-4 py-3 rounded-lg bg-primary/5 border border-primary/10">
                    <p className="text-xs text-foreground-muted text-center">
                        🔒 Your information is private and secure. We use it only to personalize your experience.
                    </p>
                </div>
            </div>
        </div>
    );
}
