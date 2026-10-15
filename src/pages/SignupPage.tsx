import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button, FormField, TextInput } from '../components/ui';

interface Form {
  fullName: string;
  email: string;
  company: string;
  password: string;
  confirm: string;
}

type Errors = Partial<Record<keyof Form, string>>;

const strength = (pw: string) => {
  let s = 0;
  if (pw.length >= 8) s++;
  if (/[A-Z]/.test(pw)) s++;
  if (/[0-9]/.test(pw)) s++;
  if (/[^a-zA-Z0-9]/.test(pw)) s++;
  return s;
};

const sColors = [
  '',
  '#ef4444',
  '#f97316',
  '#22c55e',
  '#16a34a',
];

const sLabels = [
  '',
  'Weak',
  'Fair',
  'Good',
  'Strong',
];

const SignupPage: React.FC = () => {
  const navigate = useNavigate();
  const { signUpOwner, showToast } = useAuth();

  const [form, setForm] = useState<Form>({
    fullName: '',
    email: '',
    company: '',
    password: '',
    confirm: '',
  });

  const [errors, setErrors] = useState<Errors>({});
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);

  const set =
    (k: keyof Form) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setForm((p) => ({ ...p, [k]: e.target.value }));
    };
 
  const validate = (): boolean => {
    const e: Errors = {};

    if (!form.fullName.trim()) {
      e.fullName = 'Full name is required.';
    } else if (form.fullName.trim().length < 2) {
      e.fullName = 'Full name must contain at least 2 characters.';
    }

    const email = form.email.trim();

    if (!email) {
      e.email = 'Email address is required.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      e.email = 'Enter a valid email address.';
    }

    if (!form.company.trim()) {
      e.company = 'Company name is required.';
    } else if (form.company.trim().length < 2) {
      e.company = 'Company name must contain at least 2 characters.';
    }

    if (!form.password) {
      e.password = 'Password is required.';
    } else if (form.password.length < 8) {
      e.password = 'Password must contain at least 8 characters.';
    } else if (!/[A-Z]/.test(form.password)) {
      e.password = 'Include at least one uppercase letter.';
    } else if (!/[0-9]/.test(form.password)) {
      e.password = 'Include at least one number.';
    }

    if (!form.confirm) {
      e.confirm = 'Please confirm your password.';
    } else if (form.password !== form.confirm) {
      e.confirm = 'Passwords do not match.';
    }

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (
    e?: React.FormEvent<HTMLFormElement>
  ) => {
    e?.preventDefault();

    setLoading(true);

    const err = await signUpOwner(
      form.email,
      form.password,
      form.fullName,
      form.company
    );

    setLoading(false);

    if (err) {
      showToast(err, 'error');
      return;
    }

    showToast(
      'Account created. Please check your email to verify your account.',
      'success'
    );

    navigate('/verify-email', {
      state: { email: form.email }
    });
  };

  const s = strength(form.password);

  const steps = [
    {
      n: '1',
      title: 'Create your owner account',
      sub: 'Set up your company profile',
      accent: 'rgba(251,191,36,.20)',
    },
    {
      n: '2',
      title: 'Set up departments',
      sub: 'Sales, Marketing, Operations',
      accent: 'rgba(249,115,22,.20)',
    },
    {
      n: '3',
      title: 'Invite your team',
      sub: 'Give each department its own access',
      accent: 'rgba(251,191,36,.20)',
    },
  ];

  const features = [
    { icon: '🚀', text: 'Free 14-day trial' },
    { icon: '🔒', text: 'Secure workspace' },
    { icon: '🏢', text: 'Company isolation' },
  ];

  return (
    <div
      style={{
        display: 'flex',
        minHeight: '100vh',
        minWidth: 0,
        flexDirection: 'row',
        overflowX: 'hidden',
        background: 'var(--white)',
      }}
    >
      {/* LEFT PANEL */}
      <div
        className="hide-mobile"
        style={{
          flex: '0 0 46%',
          maxWidth: 520,
          background:
            'linear-gradient(150deg, #1a1208 0%, #2d1f0a 35%, #7c2d00 75%, #c2410c 100%)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '48px 52px',
          position: 'relative',
          overflow: 'hidden',
          boxSizing: 'border-box',
        }}
      >
        {/* Warm glow effects */}
        <div
          style={{
            position: 'absolute',
            top: -40,
            right: -40,
            width: 260,
            height: 260,
            borderRadius: '50%',
            background: 'rgba(251,191,36,.15)',
            filter: 'blur(50px)',
            pointerEvents: 'none',
          }}
        />

        <div
          style={{
            position: 'absolute',
            bottom: -60,
            left: 20,
            width: 200,
            height: 200,
            borderRadius: '50%',
            background: 'rgba(234,88,12,.20)',
            filter: 'blur(45px)',
            pointerEvents: 'none',
          }}
        />

        {/* Decorative glow */}
        <div
          style={{
            position: 'absolute',
            top: '42%',
            right: '-100px',
            width: 240,
            height: 240,
            borderRadius: '50%',
            background: 'rgba(251,146,60,.08)',
            filter: 'blur(60px)',
            pointerEvents: 'none',
          }}
        />

        <div style={{ position: 'relative', zIndex: 1 }}>
          {/* Logo */}
          <div
            onClick={() => navigate('/')}
            style={{
              fontFamily: "'Sora', sans-serif",
              fontWeight: 800,
              fontSize: '1.3rem',
              color: '#fff',
              marginBottom: 42,
              cursor: 'pointer',
              letterSpacing: '-.5px',
            }}
          >
            Trace
            <span style={{ color: 'var(--gold)' }}>Wise</span>
          </div>

          {/* Heading */}
          <h2
            style={{
              fontSize: 'clamp(1.5rem, 2.4vw, 2rem)',
              fontWeight: 800,
              color: '#fff',
              lineHeight: 1.25,
              margin: '0 0 12px',
              letterSpacing: '-.5px',
            }}
          >
            One signup.
            <br />
            Your whole company aligned.
          </h2>

          <p
            style={{
              fontSize: '.9rem',
              color: 'rgba(255,255,255,.58)',
              lineHeight: 1.7,
              margin: '0 0 30px',
              maxWidth: 330,
            }}
          >
            Create your owner account, organize your departments, and
            give every team the access it needs to work together.
          </p>

          {/* Signup steps */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 10,
              marginBottom: 30,
            }}
          >
            {steps.map((step) => (
              <div
                key={step.n}
                style={{
                  background: 'rgba(255,255,255,.06)',
                  border: '1px solid rgba(255,255,255,.10)',
                  borderRadius: 11,
                  padding: '12px 14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                }}
              >
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 9,
                    background: step.accent,
                    border: '1px solid rgba(251,191,36,.12)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    fontFamily: "'Sora', sans-serif",
                    fontWeight: 800,
                    fontSize: '.9rem',
                    color: '#fcd34d',
                  }}
                >
                  {step.n}
                </div>

                <div style={{ minWidth: 0 }}>
                  <div
                    style={{
                      fontSize: '.85rem',
                      fontWeight: 700,
                      color: '#fff',
                      marginBottom: 3,
                    }}
                  >
                    {step.title}
                  </div>

                  <div
                    style={{
                      fontSize: '.72rem',
                      color: 'rgba(255,255,255,.48)',
                      lineHeight: 1.5,
                    }}
                  >
                    {step.sub}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Feature badges */}
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: 8,
            }}
          >
            {features.map((feature) => (
              <div
                key={feature.text}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 7,
                  padding: '7px 10px',
                  borderRadius: 20,
                  background: 'rgba(0,0,0,.24)',
                  border: '1px solid rgba(255,255,255,.09)',
                  fontSize: '.7rem',
                  color: 'rgba(255,255,255,.78)',
                  whiteSpace: 'nowrap',
                }}
              >
                <span>{feature.icon}</span>
                <span>{feature.text}</span>
              </div>
            ))}
          </div>

          {/* Bottom message */}
          <div
            style={{
              marginTop: 30,
              padding: '14px 16px',
              background: 'rgba(0,0,0,.30)',
              border: '1px solid rgba(255,255,255,.08)',
              borderLeft: '3px solid var(--amber)',
              borderRadius: 10,
            }}
          >
            <p
              style={{
                fontSize: '.82rem',
                color: 'rgba(255,255,255,.82)',
                lineHeight: 1.65,
                margin: 0,
              }}
            >
              One workspace for your company. Clear ownership, organized
              departments, and connected documents.
            </p>
          </div>
        </div>
      </div>

      {/* RIGHT PANEL: SIGNUP FORM */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'var(--white)',
          padding: 'clamp(24px, 5vw, 48px)',
          overflowY: 'auto',
          minWidth: 0,
          boxSizing: 'border-box',
        }}
      >
        <div
          style={{
            width: '100%',
            maxWidth: 420,
            paddingTop: 12,
            paddingBottom: 12,
          }}
          className="fade-in"
        >
          {/* Logo */}
          <div
            onClick={() => navigate('/')}
            style={{
              fontFamily: "'Sora', sans-serif",
              fontWeight: 800,
              fontSize: '1.25rem',
              color: 'var(--char)',
              marginBottom: 28,
              cursor: 'pointer',
              letterSpacing: '-.4px',
            }}
          >
            Trace
            <span style={{ color: 'var(--amber)' }}>Wise</span>
          </div>

          {/* Mobile-only introduction */}
          <div
            className="hide-desktop"
            style={{
              background: 'var(--peach)',
              borderRadius: 12,
              padding: '12px 14px',
              marginBottom: 22,
              border: '1px solid var(--border)',
            }}
          >
            <div
              style={{
                fontSize: '.82rem',
                fontWeight: 700,
                color: 'var(--amber-d)',
                marginBottom: 3,
              }}
            >
              👑 Owner Account
            </div>

            <div
              style={{
                fontSize: '.77rem',
                color: 'var(--char-l)',
                lineHeight: 1.55,
              }}
            >
              Create your company workspace, set up departments, and
              organize access for your team.
            </div>
          </div>

          {/* Form heading */}
          <h3
            style={{
              fontSize: '1.6rem',
              fontWeight: 800,
              color: 'var(--char)',
              margin: '0 0 6px',
              letterSpacing: '-.5px',
            }}
          >
            Create owner account
          </h3>

          <p
            style={{
              fontSize: '.87rem',
              color: 'var(--char-l)',
              margin: '0 0 24px',
              lineHeight: 1.6,
            }}
          >
            Set up your company workspace and manage your departments
            from one place.
          </p>

          {/* Name and company fields */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
              gap: 12,
            }}
          >
            <FormField label="Full Name" error={errors.fullName}>
              <TextInput
                placeholder="Ayesha Khan"
                value={form.fullName}
                onChange={set('fullName')}
                error={!!errors.fullName}
                autoComplete="name"
              />
            </FormField>

            <FormField label="Company Name" error={errors.company}>
              <TextInput
                placeholder="Acme Corp"
                value={form.company}
                onChange={set('company')}
                error={!!errors.company}
                autoComplete="organization"
              />
            </FormField>
          </div>

          {/* Email */}
          <FormField label="Work Email" error={errors.email}>
            <TextInput
              type="email"
              placeholder="you@company.com"
              value={form.email}
              onChange={set('email')}
              error={!!errors.email}
              autoComplete="email"
              inputMode="email"
            />
          </FormField>

          {/* Password */}
          <FormField label="Password" error={errors.password}>
            <div style={{ position: 'relative' }}>
              <TextInput
                type={showPw ? 'text' : 'password'}
                placeholder="Min. 8 chars, 1 uppercase, 1 number"
                value={form.password}
                onChange={set('password')}
                error={!!errors.password}
                autoComplete="new-password"
                style={{ paddingRight: 44 }}
              />

              <button
                type="button"
                onClick={() => setShowPw((p) => !p)}
                aria-label={showPw ? 'Hide password' : 'Show password'}
                style={{
                  position: 'absolute',
                  right: 12,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '.9rem',
                  color: 'var(--char-l)',
                  padding: 4,
                }}
              >
                {showPw ? '🙈' : '👁️'}
              </button>
            </div>

            {/* Password strength */}
            {form.password && (
              <div style={{ marginTop: 7 }}>
                <div
                  style={{
                    height: 4,
                    borderRadius: 2,
                    background: 'var(--border)',
                    overflow: 'hidden',
                    display: 'flex',
                    gap: 2,
                  }}
                >
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      style={{
                        flex: 1,
                        height: '100%',
                        borderRadius: 2,
                        background:
                          i <= s ? sColors[s] : 'transparent',
                        transition: '.3s',
                      }}
                    />
                  ))}
                </div>

                <span
                  style={{
                    fontSize: '.72rem',
                    color: sColors[s] || 'var(--char-l)',
                    marginTop: 4,
                    display: 'block',
                  }}
                >
                  {sLabels[s]}
                </span>
              </div>
            )}
          </FormField>

          {/* Confirm password */}
          <FormField label="Confirm Password" error={errors.confirm}>
            <TextInput
              type="password"
              placeholder="Repeat password"
              value={form.confirm}
              onChange={set('confirm')}
              error={!!errors.confirm}
              autoComplete="new-password"
              onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                e.currentTarget.form?.requestSubmit();
                }
              }}
            />
          </FormField>

          {/* Signup button */}
          <Button
            fullWidth
            loading={loading}
            style={{
              padding: 13,
              fontSize: '1rem',
              marginTop: 4,
            }}
            onClick={() => handleSubmit()}
          >
            Create Owner Account →
          </Button>

          {/* Terms */}
          <p
            style={{
              fontSize: '.73rem',
              color: 'var(--char-l)',
              textAlign: 'center',
              marginTop: 12,
              lineHeight: 1.6,
            }}
          >
            By signing up you agree to our{' '}
            <span
              onClick={() => navigate('/terms')}
              style={{
                color: 'var(--amber)',
                cursor: 'pointer',
                fontWeight: 600,
              }}
            >
              Terms
            </span>{' '}
            and{' '}
            <span
              onClick={() => navigate('/privacy')}
              style={{
                color: 'var(--amber)',
                cursor: 'pointer',
                fontWeight: 600,
              }}
            >
              Privacy Policy
            </span>
          </p>

          {/* Divider */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              margin: '20px 0',
            }}
          >
            <div
              style={{
                flex: 1,
                height: 1,
                background: 'var(--border)',
              }}
            />

            <span
              style={{
                fontSize: '.75rem',
                color: 'var(--char-l)',
                whiteSpace: 'nowrap',
              }}
            >
              already have an account?
            </span>

            <div
              style={{
                flex: 1,
                height: 1,
                background: 'var(--border)',
              }}
            />
          </div>

          {/* Login button */}
          <Button
            variant="ghost"
            fullWidth
            style={{ padding: 12 }}
            onClick={() => navigate('/login')}
          >
            Sign in
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SignupPage; 