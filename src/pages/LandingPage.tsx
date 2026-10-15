import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import LandingNav from '../components/layout/LandingNav';
import { Button, Tag, SectionHeader } from '../components/ui';

/* ── Mini flow node ──── */
const FN: React.FC<{ children: React.ReactNode; t?: 'default'|'active'|'ai' }> = ({ children, t='default' }) => {
  const bg: Record<string,React.CSSProperties> = {
    default: { background:'#fff', borderColor:'var(--border)', color:'var(--char-m)' },
    active:  { background:'var(--peach)', borderColor:'var(--amber)', color:'var(--amber-d)' },
    ai:      { background:'linear-gradient(135deg,#fffbeb,#fff7ed)', borderColor:'var(--gold)', color:'var(--amber-dd)' },
  };
  return <div style={{ border:'1.5px solid', borderRadius:12, padding:'10px 18px', fontSize:'.8rem', fontWeight:600, textAlign:'center', minWidth:200, ...bg[t] }}>{children}</div>;
};
const Arr: React.FC = () => <div style={{ width:2, height:16, background:'var(--border)', margin:'0 auto' }} />;

/* ── Feature card ─────── */
const FeatCard: React.FC<{ icon:string; title:string; desc:string }> = ({ icon, title, desc }) => {
  const [h,setH]=useState(false);
  return (
    <div onMouseEnter={()=>setH(true)} onMouseLeave={()=>setH(false)}
      style={{ padding:'28px', borderRadius:16, border:`1.5px solid ${h?'var(--amber)':'var(--border)'}`, transform:h?'translateY(-3px)':'none', boxShadow:h?'0 8px 32px rgba(249,115,22,.10)':'none', transition:'all .2s', background:'#fff' }}>
      <div style={{ width:46, height:46, borderRadius:12, background:'var(--peach)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.3rem', marginBottom:16 }}>{icon}</div>
      <h3 style={{ fontSize:'1rem', fontWeight:700, marginBottom:7, color:'var(--char)' }}>{title}</h3>
      <p style={{ fontSize:'.87rem', color:'var(--char-l)', lineHeight:1.65 }}>{desc}</p>
    </div>
  );
};

/* ── Testimonial ─────── */
const TestiCard: React.FC<{ init:string; name:string; role:string; quote:string }> = ({ init, name, role, quote }) => {
  const [h,setH]=useState(false);
  return (
    <div onMouseEnter={()=>setH(true)} onMouseLeave={()=>setH(false)}
      style={{ padding:'26px', borderRadius:18, border:`1.5px solid ${h?'var(--amber)':'var(--border)'}`, display:'flex', flexDirection:'column', gap:14, transition:'all .2s', transform:h?'translateY(-2px)':'none' }}>
      <div style={{ color:'var(--gold)', letterSpacing:2 }}>★★★★★</div>
      <p style={{ fontSize:'.88rem', color:'var(--char-m)', lineHeight:1.7, fontStyle:'italic', flex:1 }}>"{quote}"</p>
      <div style={{ display:'flex', alignItems:'center', gap:10 }}>
        <div style={{ width:36, height:36, borderRadius:'50%', background:'linear-gradient(135deg,var(--amber),var(--gold))', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:"'Sora',sans-serif", fontWeight:700, fontSize:'.8rem', color:'#fff', flexShrink:0 }}>{init}</div>
        <div><div style={{ fontSize:'.87rem', fontWeight:700, color:'var(--char)' }}>{name}</div><div style={{ fontSize:'.73rem', color:'var(--char-l)' }}>{role}</div></div>
      </div>
    </div>
  );
};

/* ── FAQ item ─────────── */
const FAQItem: React.FC<{ q:string; a:string; open:boolean; toggle:()=>void }> = ({ q, a, open, toggle }) => (
  <div style={{ borderBottom:'1px solid var(--border)' }}>
    <div onClick={toggle} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', gap:16, padding:'18px 0', cursor:'pointer' }}>
      <h4 style={{ fontSize:'.95rem', fontWeight:600, color:'var(--char)', lineHeight:1.4 }}>{q}</h4>
      <div style={{ width:26, height:26, borderRadius:'50%', border:`1.5px solid ${open?'var(--amber)':'var(--border)'}`, background:open?'var(--amber)':'transparent', display:'flex', alignItems:'center', justifyContent:'center', color:open?'#fff':'var(--amber)', fontSize:'.75rem', flexShrink:0, transform:open?'rotate(45deg)':'none', transition:'.2s' }}>+</div>
    </div>
    <div style={{ fontSize:'.87rem', color:'var(--char-l)', lineHeight:1.7, maxHeight:open?200:0, overflow:'hidden', paddingBottom:open?14:0, transition:'all .3s' }}>{a}</div>
  </div>
);

const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const [faqOpen, setFaqOpen] = useState<number>(0);

  const features = [
    { icon:'🕸️', title:'Live Document Relationship Map',  desc:'Automatically maps how every document in your workspace connects — so nothing is ever siloed or overlooked.' },
    { icon:'⚡', title:'Instant Impact Detection',         desc:'The moment a document changes, every related file is scanned and flagged before problems reach your customers.' },
    { icon:'💬', title:'Plain-Language Explanations',      desc:'Not just what\'s affected — but why. Every alert includes a clear rationale so your team can act with confidence.' },
    { icon:'🔔', title:'Department-Targeted Alerts',       desc:'Route the right alert to the right team the moment a relevant change is detected. No noise, no gaps.' },
    { icon:'✅', title:'Structured Approval Workflows',    desc:'Teams approve or reject AI-suggested updates in one auditable flow — no more scattered email threads.' },
    { icon:'📊', title:'Change Velocity Analytics',        desc:'Track how quickly teams respond, where bottlenecks occur, and which documents carry the highest risk.' },
    { icon:'🔒', title:'Role-Based Access Control',        desc:'Decide who can view, edit, and approve documents at the department level — keeping sensitive materials safe.' },
    { icon:'🗂️', title:'Full Audit Trail',                 desc:'Every change, approval, and rejection is timestamped and logged for compliance and accountability.' },
    { icon:'🔗', title:'Seamless File Connections',        desc:'Connect your existing cloud storage in minutes. TraceWise fits into how your team already works.' },
  ];

  const faqs = [
    { q:'How quickly can my team get started?',         a:'Most teams are fully set up within the same business day. Connect your file storage, upload your documents, and TraceWise begins mapping relationships immediately.' },
    { q:'What document types are supported?',           a:'TraceWise works with all standard business formats — written documents, spreadsheets, presentations, and PDFs. If your team creates it, TraceWise can track it.' },
    { q:'How does it know which documents are related?',a:'TraceWise reads the meaning inside each document — not just file names or folder locations — and builds a live map of connections based on shared concepts, data references, and structure.' },
    { q:'Is my company\'s data secure?',                a:'Yes. All data is encrypted in transit and at rest. We never use your documents to train any models, and your data is never shared with other organizations.' },
    { q:'Can I control which departments see which changes?', a:'Absolutely. The owner creates each department and controls exactly which documents they can access and manage — no cross-department visibility without explicit permission.' },
    { q:'What happens if an update is rejected?',       a:'The team member can add a note explaining why. The document returns for revision, and the full exchange is logged in the audit trail.' },
  ];

  return (
    <div>
      <LandingNav />

      {/* ── HERO ─────────────────────────────────────────── */}
      <section style={{ display:'grid', gridTemplateColumns:'1fr 1fr', minHeight:'calc(100vh - 68px)', alignItems:'center', padding:'0 clamp(20px,6vw,72px)', gap:40, position:'relative', overflow:'hidden' }}>
        <div style={{ position:'absolute', right:-100, top:-80, width:500, height:500, borderRadius:'50%', background:'radial-gradient(circle,rgba(251,191,36,.18) 0%,rgba(249,115,22,.06) 60%,transparent 80%)', pointerEvents:'none' }} />
        <div className="fade-in">
          <div style={{ fontSize:'.78rem', fontWeight:600, letterSpacing:'.08em', color:'var(--amber)', textTransform:'uppercase', marginBottom:14 }}>AI-Powered Document Intelligence</div>
          <h1 style={{ fontSize:'clamp(2rem,5vw,3.4rem)', fontWeight:800, lineHeight:1.1, color:'var(--char)', marginBottom:18 }}>
            Know Every Impact<br />Before It <em style={{ fontStyle:'normal', color:'var(--amber)' }}>Spreads</em>
          </h1>
          <p style={{ fontSize:'clamp(.95rem,2vw,1.1rem)', lineHeight:1.7, color:'var(--char-l)', maxWidth:460, marginBottom:32 }}>
            TraceWise instantly maps how a change in one document ripples across your entire organization — so Sales, Marketing, and Operations stay aligned without chasing updates.
          </p>
          <div style={{ display:'flex', gap:12, flexWrap:'wrap' }}>
            <Button size="lg" onClick={() => navigate('/signup')}>Start Free Trial</Button>
            <Button variant="ghost" size="lg" onClick={() => navigate('/login')}>Sign In →</Button>
          </div>
          <div style={{ display:'flex', gap:32, marginTop:40, paddingTop:32, borderTop:'1px solid var(--border)', flexWrap:'wrap' }}>
            {[['94%','Fewer missed updates'],['3.2×','Faster review cycles'],['12k+','Documents tracked']].map(([n,l]) => (
              <div key={l}><div style={{ fontFamily:"'Sora',sans-serif", fontWeight:800, fontSize:'1.9rem', color:'var(--amber)' }}>{n}</div><div style={{ fontSize:'.78rem', color:'var(--char-l)', marginTop:2 }}>{l}</div></div>
            ))}
          </div>
        </div>

        {/* Mini flow diagram — hidden on mobile */}
        <div className="hide-mobile" style={{ display:'flex', flexDirection:'column', alignItems:'center', padding:'24px 0' }}>
          <FN t="active">📤 Upload Company Documents</FN><Arr />
          <FN t="ai">🤖 AI Reads &amp; Extracts Key Info</FN><Arr />
          <FN>🔗 Create Dependency Map</FN><Arr />
          <FN t="active">✏️ Employee Updates a Document</FN><Arr />
          <FN t="ai">⚡ AI Detects Change &amp; Finds Impact</FN><Arr />
          <div style={{ border:'1.5px dashed var(--amber)', background:'rgba(249,115,22,.05)', borderRadius:12, padding:'10px 20px', fontSize:'.8rem', fontWeight:600, color:'var(--amber-d)', minWidth:160, textAlign:'center' }}>Approve Updates?</div>
          <div style={{ display:'flex', gap:16, marginTop:8 }}>
            {[['Yes','var(--success)','rgba(22,163,74,.12)','✅ Mark Reviewed'],['No','var(--error)','rgba(220,38,38,.10)','✏️ Revise & Resubmit']].map(([l,c,bg,n]) => (
              <div key={l as string} style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:4 }}>
                <span style={{ fontSize:'.68rem', fontWeight:700, padding:'2px 8px', borderRadius:8, background:bg as string, color:c as string }}>{l}</span>
                <FN>{n}</FN>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TRUSTED BY ─────────────────────────────────── */}
      <section style={{ padding:'44px clamp(20px,6vw,72px)', background:'#fff', borderTop:'1px solid var(--border)', borderBottom:'1px solid var(--border)' }}>
        <div style={{ textAlign:'center', fontSize:'.75rem', fontWeight:600, letterSpacing:'.08em', color:'var(--char-l)', textTransform:'uppercase', marginBottom:24 }}>Trusted by revenue teams at fast-growing companies</div>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:16, flexWrap:'wrap' }}>
          {['NovaSales Co.','BrightMark Agency','OpsFlow Inc.','Meridian Group','Vendara Partners','LaunchGrid'].map(c => (
            <div key={c} style={{ padding:'8px 18px', borderRadius:40, border:'1.5px solid var(--border)', fontSize:'.85rem', fontWeight:700, color:'var(--char-m)', fontFamily:"'Sora',sans-serif", opacity:.7 }}>🏢 {c}</div>
          ))}
        </div>
      </section>

      {/* ── FEATURES ───────────────────────────────────── */}
      <section id="features" style={{ padding:'80px clamp(20px,6vw,72px)', background:'#fff' }}>
        <SectionHeader tag="Core Capabilities" title="Built for teams that can't afford surprises" subtitle="From Sales contracts to Marketing briefs, every downstream document stays aligned automatically." />
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(280px,1fr))', gap:22, maxWidth:1100, margin:'0 auto' }}>
          {features.map(f => <FeatCard key={f.title} icon={f.icon} title={f.title} desc={f.desc} />)}
        </div>
      </section>

      {/* ── HOW IT WORKS ───────────────────────────────── */}
      <section id="how-it-works" style={{ padding:'80px clamp(20px,6vw,72px)', background:'var(--peach)' }}>
        <SectionHeader tag="How It Works" title="From upload to alignment in four steps" subtitle="No complicated setup. TraceWise is live for your whole team in under a day." />
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))', gap:24, maxWidth:1000, margin:'0 auto' }}>
          {[['1','Bring Your Documents','Upload existing files or connect your cloud storage. TraceWise ingests everything and maps relationships immediately.'],
            ['2','Relationships Are Mapped','A live map of document connections is built automatically — contracts, briefs, playbooks, pricing sheets.'],
            ['3','Changes Are Caught','Any update triggers an instant impact analysis. Affected documents are flagged with clear explanations.'],
            ['4','Teams Take Action','The right departments are notified with context. They review, approve, or revise — and documents stay in sync.']
          ].map(([n,t,d]) => (
            <div key={n} style={{ textAlign:'center', padding:'0 8px' }}>
              <div style={{ width:52, height:52, borderRadius:'50%', background:'linear-gradient(135deg,var(--amber),var(--gold))', color:'#fff', fontFamily:"'Sora',sans-serif", fontWeight:800, fontSize:'1.05rem', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 14px' }}>{n}</div>
              <h4 style={{ fontSize:'.95rem', fontWeight:700, marginBottom:6, color:'var(--char)' }}>{t}</h4>
              <p style={{ fontSize:'.82rem', color:'var(--char-l)', lineHeight:1.6 }}>{d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── USE CASES ──────────────────────────────────── */}
      <section id="use-cases" style={{ padding:'80px clamp(20px,6vw,72px)', background:'var(--peach)' }}>
        <SectionHeader tag="Who It's For" title="Every department. One source of truth." />
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(280px,1fr))', gap:20, maxWidth:1100, margin:'0 auto' }}>
          {[
            { icon:'📈', title:'Sales Teams', desc:'Keep proposals, playbooks, pricing decks, and partner agreements perfectly in sync.', bullets:['Pricing updates flow to all sales materials','Proposals reflect the latest positioning','Partner agreements align with current terms'] },
            { icon:'📣', title:'Marketing Teams', desc:'Ensure briefs, ad copy, and guidelines always reflect the latest product and pricing changes.', bullets:['Campaign copy aligns with current pricing','Brand guides update across all briefs','Launch materials reflect current specs'] },
            { icon:'⚙️', title:'Operations Teams', desc:'Maintain consistency across SOPs, process guides, and vendor contracts whenever policies change.', bullets:['Process updates propagate to all SOPs','Vendor contracts flag policy changes','Internal guides stay consistent'] },
            { icon:'⚖️', title:'Legal & Compliance', desc:'Surface every contract and agreement that may be affected by business changes — before they become liabilities.', bullets:['Contracts flagged when policies change','Compliance docs stay current','Full audit trail for every change'] },
          ].map(uc => (
            <div key={uc.title} style={{ background:'#fff', borderRadius:18, padding:'26px', border:'1.5px solid var(--border)' }}>
              <div style={{ width:48, height:48, borderRadius:12, background:'var(--peach)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.4rem', marginBottom:14, border:'1.5px solid var(--border)' }}>{uc.icon}</div>
              <h3 style={{ fontSize:'1rem', fontWeight:700, color:'var(--char)', marginBottom:6 }}>{uc.title}</h3>
              <p style={{ fontSize:'.85rem', color:'var(--char-l)', lineHeight:1.6, marginBottom:12 }}>{uc.desc}</p>
              <ul style={{ listStyle:'none', display:'flex', flexDirection:'column', gap:5 }}>
                {uc.bullets.map(b => <li key={b} style={{ fontSize:'.8rem', color:'var(--char-m)', display:'flex', gap:6 }}><span style={{ color:'var(--amber)', fontWeight:700 }}>→</span>{b}</li>)}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* ── IMPACT BAND ────────────────────────────────── */}
      <section style={{ padding:'72px clamp(20px,6vw,72px)', background:'linear-gradient(135deg,var(--char),#292524)', color:'#fff' }}>
        <div style={{ maxWidth:1100, margin:'0 auto', display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(260px,1fr))', gap:48, alignItems:'center' }}>
          <div>
            <Tag style={{ background:'rgba(251,191,36,.15)', color:'var(--gold)', marginBottom:14 }}>Real Results</Tag>
            <h2 style={{ fontSize:'clamp(1.5rem,4vw,2.2rem)', fontWeight:800, lineHeight:1.2, marginBottom:12, marginTop:10 }}>Document chaos costs more than you think</h2>
            <p style={{ color:'rgba(255,255,255,.6)', lineHeight:1.7, marginBottom:24, maxWidth:380 }}>Teams using TraceWise report dramatic reductions in time spent chasing updates and managing version confusion — from day one.</p>
            <Button onClick={() => navigate('/signup')}>See It in Action →</Button>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
            {[['94%','Reduction in missed document updates'],['3.2×','Faster review and approval cycles'],['6 hrs','Saved per team member each week'],['12k+','Documents actively tracked']].map(([v,d]) => (
              <div key={v as string} style={{ padding:20, borderRadius:14, background:'rgba(255,255,255,.05)', border:'1px solid rgba(255,255,255,.08)' }}>
                <div style={{ fontFamily:"'Sora',sans-serif", fontWeight:800, fontSize:'2rem', color:'var(--gold)', lineHeight:1 }}>{v}</div>
                <div style={{ fontSize:'.8rem', color:'rgba(255,255,255,.5)', marginTop:6, lineHeight:1.5 }}>{d}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ───────────────────────────────── */}
      <section style={{ padding:'80px clamp(20px,6vw,72px)', background:'#fff' }}>
        <SectionHeader tag="What Teams Say" title="Trusted by people who can't afford version chaos" />
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(260px,1fr))', gap:20, maxWidth:1000, margin:'0 auto' }}>
          <TestiCard init="FR" name="Farrukh Rashidov" role="Head of Revenue Ops" quote="Before TraceWise, our reps were quoting outdated pricing for weeks. Now everyone knows the moment pricing changes." />
          <TestiCard init="SM" name="Sara Mehmood" role="VP Marketing, BrightMark" quote="Our marketing briefs used to be impossible to keep in sync with Sales. TraceWise tells us exactly what to update and why." />
          <TestiCard init="AK" name="Ayesha Khan" role="Director of Operations" quote="We have 300+ documents across Legal, Ops, and HR. TraceWise gives us confidence that nothing slips through the cracks." />
        </div>
      </section>

      {/* ── PRICING ────────────────────────────────────── */}
      <section id="pricing" style={{ padding:'80px clamp(20px,6vw,72px)', background:'var(--peach)' }}>
        <SectionHeader tag="Pricing" title="Transparent plans that grow with your team" subtitle="No hidden fees. Start free and scale when you're ready." />
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(260px,1fr))', gap:20, maxWidth:960, margin:'0 auto' }}>
          {[
            { name:'Starter', price:'$29', period:'/ user / month', featured:false, features:['Up to 500 documents','3 departments','Basic dependency map','Email notifications','7-day history'] },
            { name:'Growth',  price:'$79', period:'/ user / month', featured:true,  features:['Unlimited documents','Unlimited departments','Full dependency map','Approval workflows','Analytics dashboard','90-day history','Priority support'] },
            { name:'Enterprise', price:'Custom', period:'tailored pricing', featured:false, features:['Everything in Growth','SSO included','Custom integrations','Role-based permissions','Unlimited history','Dedicated success manager'] },
          ].map(p => (
            <div key={p.name} style={{ padding:'32px 28px', borderRadius:20, background:'#fff', border:`1.5px solid ${p.featured?'var(--amber)':'var(--border)'}`, boxShadow:p.featured?'0 12px 40px rgba(249,115,22,.15)':'none', position:'relative', textAlign:'center' }}>
              {p.featured && <div style={{ position:'absolute', top:-14, left:'50%', transform:'translateX(-50%)', background:'var(--amber)', color:'#fff', fontSize:'.7rem', fontWeight:700, padding:'3px 14px', borderRadius:20 }}>Most Popular</div>}
              <div style={{ fontFamily:"'Sora',sans-serif", fontWeight:700, fontSize:'1rem', color:'var(--char-m)', marginBottom:6 }}>{p.name}</div>
              <div style={{ fontFamily:"'Sora',sans-serif", fontWeight:800, fontSize:'2.4rem', color:'var(--char)', lineHeight:1 }}>{p.price}</div>
              <div style={{ fontSize:'.78rem', color:'var(--char-l)', margin:'4px 0 20px' }}>{p.period}</div>
              <ul style={{ listStyle:'none', textAlign:'left', marginBottom:24, display:'flex', flexDirection:'column', gap:8 }}>
                {p.features.map(f => <li key={f} style={{ fontSize:'.83rem', color:'var(--char-m)', display:'flex', gap:8 }}><span style={{ color:'var(--amber)', fontWeight:700 }}>✓</span>{f}</li>)}
              </ul>
              <Button variant={p.featured?'primary':'ghost'} fullWidth onClick={() => navigate(p.name==='Enterprise'?'/':'signup')}>
                {p.name==='Enterprise'?'Contact Sales':'Start Free Trial'}
              </Button>
            </div>
          ))}
        </div>
        <p style={{ textAlign:'center', marginTop:24, fontSize:'.83rem', color:'var(--char-l)' }}>All plans include a 14-day free trial. No credit card required.</p>
      </section>

      {/* ── FAQ ────────────────────────────────────────── */}
      <section style={{ padding:'80px clamp(20px,6vw,72px)', background:'#fff' }}>
        <SectionHeader tag="FAQ" title="Common questions, straight answers" />
        <div style={{ maxWidth:700, margin:'0 auto' }}>
          {faqs.map((f,i) => <FAQItem key={i} q={f.q} a={f.a} open={faqOpen===i} toggle={() => setFaqOpen(faqOpen===i?-1:i)} />)}
        </div>
      </section>

      {/* ── CTA ────────────────────────────────────────── */}
      <section style={{ padding:'72px clamp(20px,6vw,72px)', background:'linear-gradient(135deg,var(--amber-dd),var(--amber),var(--gold))', textAlign:'center', color:'#fff' }}>
        <h2 style={{ fontSize:'clamp(1.6rem,4vw,2.4rem)', fontWeight:800, marginBottom:12 }}>Your documents are talking.<br />Is your team listening?</h2>
        <p style={{ fontSize:'1rem', opacity:.9, maxWidth:480, margin:'0 auto 28px', lineHeight:1.65 }}>Join 2,000+ revenue and operations teams who trust TraceWise to keep their people in perfect sync.</p>
        <div style={{ display:'flex', gap:14, justifyContent:'center', flexWrap:'wrap' }}>
          <Button variant="white" size="lg" onClick={() => navigate('/signup')}>Start Free — No Card Needed</Button>
          <button onClick={() => navigate('/login')} style={{ background:'rgba(255,255,255,.15)', color:'#fff', border:'2px solid rgba(255,255,255,.4)', padding:'14px 28px', fontSize:'.95rem', borderRadius:10, fontFamily:"'Inter',sans-serif", fontWeight:600, cursor:'pointer' }}>Sign In →</button>
        </div>
      </section>

      {/* ── FOOTER ─────────────────────────────────────── */}
      <footer style={{ background:'var(--char)', color:'rgba(255,255,255,.5)', padding:'48px clamp(20px,6vw,72px) 28px' }}>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(160px,1fr))', gap:36, maxWidth:1100, margin:'0 auto 36px' }}>
          <div>
            <div style={{ fontFamily:"'Sora',sans-serif", fontWeight:800, fontSize:'1.2rem', color:'#fff', marginBottom:10 }}>Trace<span style={{ color:'var(--amber)' }}>Wise</span></div>
            <p style={{ fontSize:'.83rem', lineHeight:1.65, maxWidth:250 }}>The intelligent document alignment platform for teams that can't afford to work from outdated information.</p>
          </div>
          {[{ h:'Product', l:['Features','How It Works','Pricing','Integrations'] },{ h:'Company', l:['About Us','Careers','Blog','Security'] },{ h:'Support', l:['Help Center','Contact Us','Privacy Policy','Terms'] }].map(col => (
            <div key={col.h}>
              <h4 style={{ fontSize:'.75rem', fontWeight:700, textTransform:'uppercase', letterSpacing:'.06em', color:'rgba(255,255,255,.35)', marginBottom:14 }}>{col.h}</h4>
              {col.l.map(l => <div key={l} style={{ fontSize:'.83rem', marginBottom:8, cursor:'pointer' }} onMouseEnter={e=>(e.currentTarget.style.color='#fff')} onMouseLeave={e=>(e.currentTarget.style.color='rgba(255,255,255,.5)')}>{l}</div>)}
            </div>
          ))}
        </div>
        <div style={{ borderTop:'1px solid rgba(255,255,255,.08)', paddingTop:20, display:'flex', justifyContent:'space-between', flexWrap:'wrap', gap:10, maxWidth:1100, margin:'0 auto', fontSize:'.77rem' }}>
          <span>© 2026 TraceWise Inc. All rights reserved.</span>
          <span>Made for teams who move fast.</span>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
