import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Lock, Mail, GraduationCap, ArrowRight, Loader, Eye, EyeOff } from 'lucide-react';
import { toast, ToastContainer } from 'react-toastify';

const Login = () => {
    const { login } = useAuth();
    const navigate = useNavigate();
    const [credentials, setCredentials] = useState({ email: '', password: '' });
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const user = await login(credentials);
            toast.success(`Welcome ${user.name || 'Admin'}!`);
            
            if (user.role === 'ADMIN') {
                setTimeout(() => navigate('/admin/dashboard'), 1000);
            } else {
                setTimeout(() => navigate('/student/dashboard'), 1000);
            }
        } catch (error) {
            toast.error("Invalid email or password.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-vh-100 d-flex align-items-center justify-content-center bg-royal p-4">
            <ToastContainer />
            <div className="login-card p-5 rounded-5 shadow-2xl border border-white border-opacity-20 animate-fade-in">
                <div className="text-center mb-5">
                    <div className="bg-primary d-inline-flex p-4 rounded-circle mb-4 shadow-lg ring-4 ring-primary ring-opacity-10">
                        <GraduationCap size={48} className="text-white" />
                    </div>
                    <h1 className="fw-bold text-dark mb-2 ls-tight">Exam<span className="text-primary">Pro</span></h1>
                    <p className="text-muted small text-uppercase fw-bold ls-wide">Administrative Portal</p>
                </div>

                <form onSubmit={handleSubmit} className="d-flex flex-column gap-4">
                    <div className="form-floating position-relative">
                        <div className="position-absolute top-50 translate-middle-y start-0 ms-3 text-muted">
                            <Mail size={18} />
                        </div>
                        <input 
                            type="email" 
                            required
                            className="form-control ps-5 border-0 bg-light rounded-4 py-3" 
                            placeholder="Email Address"
                            value={credentials.email}
                            onChange={e => setCredentials({...credentials, email: e.target.value})}
                        />
                        <label className="ps-5 text-muted small">Email Address</label>
                    </div>

                    <div className="form-floating position-relative">
                        <div className="position-absolute top-50 translate-middle-y start-0 ms-3 text-muted">
                            <Lock size={18} />
                        </div>
                        <input 
                            type={showPassword ? "text" : "password"} 
                            required
                            className="form-control ps-5 border-0 bg-light rounded-4 py-3" 
                            placeholder="Password"
                            value={credentials.password}
                            onChange={e => setCredentials({...credentials, password: e.target.value})}
                        />
                        <button 
                            type="button"
                            className="btn btn-link position-absolute top-50 end-0 translate-middle-y me-2 text-muted p-2"
                            onClick={() => setShowPassword(!showPassword)}
                        >
                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                        <label className="ps-5 text-muted small">Password</label>
                    </div>

                    <button 
                        type="submit" 
                        disabled={loading}
                        className="btn btn-primary btn-lg rounded-pill py-3 fw-bold shadow-xl d-flex align-items-center justify-content-center gap-2 hover-up transition-all"
                    >
                        {loading ? <Loader className="animate-spin" size={20} /> : <>Sign In <ArrowRight size={20} /></>}
                    </button>
                    
                    <div className="text-center mt-3">
                        <span className="text-muted small">Forgot credentials? Contact IT Support</span>
                    </div>
                </form>
            </div>

            <style>{`
                .bg-royal {
                    background: radial-gradient(circle at top right, #f8f9fa 0%, #e9ecef 100%);
                    background-attachment: fixed;
                }
                .login-card {
                    background: rgba(255, 255, 255, 0.85);
                    backdrop-filter: blur(20px);
                    max-width: 480px;
                    width: 100%;
                }
                .ls-tight { letter-spacing: -0.025em; }
                .ls-wide { letter-spacing: 0.1em; }
                .transition-all { transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); }
                .hover-up:hover { transform: translateY(-3px); box-shadow: 0 20px 40px rgba(13, 110, 253, 0.15) !important; }
                .animate-spin { animation: spin 1s linear infinite; }
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                .animate-fade-in { animation: fadeIn 0.6s ease-out; }
                @keyframes fadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
            `}</style>
        </div>
    );
};

export default Login;
