import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button, FormField, TextInput } from '../components/ui';

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { signIn, showToast } = useAuth();
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [showPw,   setShowPw]   = useState(false);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState('');

  const handleSubmit = async () => {
    if (!email || !password) { setError('Please fill in both fields.'); return; }
    setError('');
    setLoading(true);
    const { error: err, redirectTo } = await signIn(email, password);
    setLoading(false);
    if (err) { setError(err); return; }
    showToast('Welcome back! 👋');
    navigate(redirectTo);   // ← actually navigates now
  };

  return (
    <div style={{ display:'flex', height:'100vh', overflow:'hidden', minWidth:0 }}>

      {/* ── LEFT PANEL ─────────────────────────────────────────── */}
      <div className="hide-mobile" style={{
        flex:'0 0 46%', maxWidth:520,
        background:'linear-gradient(150deg,#1a1208 0%,#2d1f0a 35%,#7c2d00 75%,#c2410c 100%)',
        display:'flex', flexDirection:'column', justifyContent:'center',
        padding:'0 52px', position:'relative', overflow:'hidden',
      }}>
        {/* warm glow orbs */}
        <div style={{ position:'absolute', top:-40, right:-40, width:260, height:260, borderRadius:'50%', background:'rgba(251,191,36,.15)', filter:'blur(50px)', pointerEvents:'none' }} />
        <div style={{ position:'absolute', bottom:-60, left:20, width:200, height:200, borderRadius:'50%', background:'rgba(234,88,12,.2)', filter:'blur(45px)', pointerEvents:'none' }} />

        <div style={{ position:'relative', zIndex:1 }}>
          {/* Logo */}
          <div onClick={() => navigate('/')} style={{ fontFamily:"'Sora',sans-serif", fontWeight:800, fontSize:'1.3rem', color:'#fff', marginBottom:48, cursor:'pointer' }}>
            Trace<span style={{ color:'var(--gold)' }}>Wise</span>
          </div>

          <h2 style={{ fontSize:'clamp(1.5rem,2.4vw,2rem)', fontWeight:800, color:'#fff', lineHeight:1.25, marginBottom:12 }}>
            Welcome back to your<br />document universe
          </h2>
          <p style={{ fontSize:'.9rem', color:'rgba(255,255,255,.55)', lineHeight:1.7, marginBottom:36, maxWidth:320 }}>
            Sign in as an owner to manage your company, or as a department member to access your workspace.
          </p>

          {/* Role cards — opaque enough to read */}
          <div style={{ display:'flex', flexDirection:'column', gap:9, marginBottom:36 }}>
            {[
              { icon:'👑', label:'Owner',            hint:'Full company access — use your signup email', accent:'rgba(251,191,36,.2)' },
              { icon:'👤', label:'Department Member', hint:'Use credentials your owner gave you',         accent:'rgba(249,115,22,.2)' },
            ].map(r => (
              <div key={r.label} style={{ background:'rgba(255,255,255,.06)', border:'1px solid rgba(255,255,255,.1)', borderRadius:11, padding:'11px 14px', display:'flex', alignItems:'center', gap:12 }}>
                <div style={{ width:34, height:34, borderRadius:8, background:r.accent, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1rem', flexShrink:0 }}>
                  {r.icon}
                </div>
                <div>
                  <div style={{ fontSize:'.85rem', fontWeight:700, color:'#fff', marginBottom:1 }}>{r.label}</div>
                  <div style={{ fontSize:'.72rem', color:'rgba(255,255,255,.45)', lineHeight:1.4 }}>{r.hint}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Testimonial — solid dark card, fully readable */}
          <div style={{
            background:'rgba(0,0,0,.45)',
            border:'1px solid rgba(255,255,255,.08)',
            borderLeft:'3px solid var(--amber)',
            borderRadius:12, padding:'16px 18px',
          }}>
            <p style={{ fontSize:'.86rem', color:'#fff', fontStyle:'italic', lineHeight:1.65, marginBottom:12 }}>
              "TraceWise saved our team 6 hours a week on update reviews. Truly indispensable for Sales ops."
            </p>
            <div style={{ display:'flex', alignItems:'center', gap:10 }}>
              <div style={{ width:32, height:32, borderRadius:'50%', background:'linear-gradient(135deg,var(--amber),var(--gold))', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'.72rem', fontWeight:800, color:'#fff', flexShrink:0 }}>
                FR
              </div>
              <div>
                <div style={{ fontSize:'.78rem', fontWeight:700, color:'rgba(255,255,255,.9)' }}>Farrukh Rashidov</div>
                <div style={{ fontSize:'.7rem', color:'rgba(255,255,255,.4)' }}>Head of Revenue Ops, NovaSales Co.</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── RIGHT PANEL — form ─────────────────────────────────── */}
      <div style={{
        flex:1, display:'flex', flexDirection:'column',
        alignItems:'center', justifyContent:'center',
        background:'var(--white)', padding:'clamp(24px,5vw,48px)',
        overflowY:'auto', minWidth:0,
      }}>
        <div style={{ width:'100%', maxWidth:400 }} className="fade-in">

          <div onClick={() => navigate('/')} style={{ fontFamily:"'Sora',sans-serif", fontWeight:800, fontSize:'1.25rem', color:'var(--char)', marginBottom:36, cursor:'pointer' }}>
            Trace<span style={{ color:'var(--amber)' }}>Wise</span>
          </div>

          {/* Mobile-only role pills */}
          <div className="hide-desktop" style={{ display:'flex', gap:8, marginBottom:22, flexWrap:'wrap' }}>
            {[{i:'👑',l:'Owner'},{i:'👤',l:'Dept Member'}].map(r => (
              <span key={r.l} style={{ fontSize:'.73rem', fontWeight:600, background:'var(--peach)', color:'var(--amber-d)', border:'1px solid var(--border)', borderRadius:20, padding:'3px 12px' }}>
                {r.i} {r.l}
              </span>
            ))}
          </div>

          <h3 style={{ fontSize:'1.6rem', fontWeight:800, color:'var(--char)', marginBottom:6 }}>Sign in</h3>
          <p style={{ fontSize:'.87rem', color:'var(--char-l)', marginBottom:28, lineHeight:1.5 }}>
            Owner or department credentials both work here.
          </p>

          <FormField label="Email">
            <TextInput
              type="email"
              placeholder="you@company.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              error={!!error}
              autoComplete="email"
              inputMode="email"
            />
          </FormField>

          <FormField label="Password">
            <div style={{ position:'relative' }}>
              <TextInput
                type={showPw ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                error={!!error}
                autoComplete="current-password"
                onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                style={{ paddingRight:44 }}
              />
              <button type="button" onClick={() => setShowPw(p => !p)}
                style={{ position:'absolute', right:12, top:'50%', transform:'translateY(-50%)', background:'none', border:'none', cursor:'pointer', fontSize:'.9rem', color:'var(--char-l)', padding:4 }}>
                {showPw ? '🙈' : '👁️'}
              </button>
            </div>
          </FormField>

          {error && (
            <div style={{ display:'flex', alignItems:'center', gap:8, background:'rgba(220,38,38,.06)', border:'1px solid rgba(220,38,38,.18)', borderRadius:8, padding:'10px 14px', marginBottom:16, marginTop:-4 }}>
              <span>⚠️</span>
              <span style={{ fontSize:'.83rem', color:'var(--error)' }}>{error}</span>
            </div>
          )}

          <div style={{ display:'flex', justifyContent:'flex-end', marginBottom:20 }}>
            <span style={{ fontSize:'.82rem', color:'var(--amber)', fontWeight:600, cursor:'pointer' }}>Forgot password?</span>
          </div>

          <Button fullWidth loading={loading} style={{ padding:13, fontSize:'1rem' }} onClick={handleSubmit}>
            Sign In
          </Button>

          <div style={{ display:'flex', alignItems:'center', gap:10, margin:'22px 0' }}>
            <div style={{ flex:1, height:1, background:'var(--border)' }} />
            <span style={{ fontSize:'.75rem', color:'var(--char-l)', whiteSpace:'nowrap' }}>new to TraceWise?</span>
            <div style={{ flex:1, height:1, background:'var(--border)' }} />
          </div>

          <Button variant="ghost" fullWidth style={{ padding:12 }} onClick={() => navigate('/signup')}>
            Create owner account
          </Button>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;