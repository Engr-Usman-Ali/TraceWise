
import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const VerifyEmailPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const email = location.state?.email as string | undefined;

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
        background: '#fffaf3',
        fontFamily: 'Arial, sans-serif',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '440px',
          padding: '36px',
          borderRadius: '20px',
          background: '#ffffff',
          boxShadow: '0 12px 40px rgba(90, 45, 10, 0.10)',
          textAlign: 'center',
        }}
      >
        <div
          style={{
            width: '64px',
            height: '64px',
            margin: '0 auto 20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '50%',
            background: '#fff0d6',
            fontSize: '30px',
          }}
        >
          ✉️
        </div>

        <h1
          style={{
            margin: '0 0 12px',
            color: '#422006',
            fontSize: '28px',
            fontWeight: 700,
          }}
        >
          Verify your email
        </h1>

        <p
          style={{
            color: '#6b6258',
            lineHeight: 1.7,
            fontSize: '15px',
          }}
        >
          Your TraceWise account has been created.
          Please open the verification email from Supabase
          and follow its instructions before signing in.
        </p>

        {email && (
          <p
            style={{
              margin: '20px 0',
              padding: '12px',
              borderRadius: '10px',
              background: '#fff7e8',
              color: '#92400e',
              overflowWrap: 'anywhere',
              fontWeight: 600,
            }}
          >
            {email}
          </p>
        )}

        <p
          style={{
            color: '#78716c',
            fontSize: '13px',
            lineHeight: 1.6,
          }}
        >
          If you cannot find the email, check your spam
          or junk folder.
        </p>

        <button
          type="button"
          onClick={() => navigate('/login')}
          style={{
            width: '100%',
            marginTop: '20px',
            padding: '14px',
            border: 'none',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, #b45309, #f59e0b)',
            color: '#ffffff',
            fontSize: '15px',
            fontWeight: 700,
            cursor: 'pointer',
          }}
        >
          Go to login
        </button>
      </div>
    </div>
  );
};

export default VerifyEmailPage;
