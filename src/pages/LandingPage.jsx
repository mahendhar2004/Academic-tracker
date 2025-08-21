import React, { useEffect, useRef, useState } from 'react';
import { motion, useScroll, useTransform, AnimatePresence, useInView } from 'framer-motion';
import { 
    GraduationCap, CheckCircle2, BarChart3, CalendarCheck, CreditCard, Users, Share2, 
    ArrowRight, Moon, Sun, Menu, X, Lightbulb, Send, Mail, Twitter, Linkedin, Github,
    Hourglass, Target
} from 'lucide-react';

// --- Data ---
const features = [
    {
        title: "Attendance Tracker",
        description: "Real-time percentages and warnings when you're close to the limit.",
        Icon: CheckCircle2,
    },
    {
        title: "Performance Analysis",
        description: "Watch your SPI/CPI calculate automatically and visualize your progress.",
        Icon: BarChart3,
    },
    {
        title: "Marks & Grades Tracker",
        description: "Log your scores for every test and assignment. Predict your final grade and stay on top of your goals.",
        Icon: Target,
    },
    {
        title: "Smart Planner",
        description: "Manage daily tasks, long-term assignments, and color-coded deadlines.",
        Icon: CalendarCheck,
    },
    {
        title: "Deadline Countdown",
        description: "Never miss a due date again. Get visual countdowns for all your assignments and exams.",
        Icon: Hourglass,
    },
    {
        title: "Expense Tracker",
        description: "Log your spending with custom categories and see where your money goes.",
        Icon: CreditCard,
    },
    {
        title: "Contacts Hub",
        description: "Keep track of important contacts, from professors to classmates.",
        Icon: Users,
    },
    {
        title: "Shareable Profile",
        description: "Build a dynamic academic profile to share your achievements.",
        Icon: Share2,
    }
];

const testimonials = [
    {
        quote: "Atrack is a lifesaver. I finally have all my deadlines and attendance in one place. The 'What If?' calculator is a genius feature for planning my grades.",
        author: "Anjali S.",
        role: "B.Tech CSE"
    },
    {
        quote: "The interface is so clean and intuitive. I love the dark mode and the little coin rewards make staying productive feel like a game. Highly recommended!",
        author: "Rohan M.",
        role: "B.E. Mechanical"
    },
    {
        quote: "As someone who struggles with organization, this app is a game-changer. The weekly timetable and planner keep me on track like never before.",
        author: "Priya K.",
        role: "B.Sc. Physics"
    }
];

// --- Animation Variants ---
const FADE_UP_ANIMATION_VARIANTS = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: 'spring' } },
};

// --- Sub-Components ---
const NeumorphicCard = ({ children, className = '', ...props }) => {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: "-50px" });

    return (
        <motion.div
            ref={ref}
            initial="hidden"
            animate={isInView ? "show" : "hidden"}
            variants={FADE_UP_ANIMATION_VARIANTS}
            className={`neumorphic-outset p-8 rounded-2xl ${className}`}
            {...props}
        >
            {children}
        </motion.div>
    );
};

const NeumorphicButton = ({ children, className = '', onClick }) => (
    <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={onClick}
        className={`neumorphic-outset neumorphic-button ${className}`}
    >
        {children}
    </motion.button>
);

const NeumorphicInput = React.forwardRef(({ className = '', ...props }, ref) => (
    <motion.input
        ref={ref}
        whileFocus={{ scale: 1.02 }}
        className={`neumorphic-input w-full p-3 rounded-lg focus:ring-2 focus:ring-custom ${className}`}
        {...props}
    />
));

const NeumorphicTextarea = React.forwardRef(({ className = '', ...props }, ref) => (
    <motion.textarea
        ref={ref}
        whileFocus={{ scale: 1.02 }}
        className={`neumorphic-input w-full p-3 rounded-lg focus:ring-2 focus:ring-custom ${className}`}
        rows="4"
        {...props}
    />
));

const FeatureDisplay = ({ activeIndex }) => {
    // Ensure activeIndex is always valid
    const validIndex = Math.max(0, Math.min(activeIndex, features.length - 1));
    const ActiveIcon = features[validIndex].Icon;
    
    return (
        <div className="relative w-full h-full flex items-center justify-center">
            <motion.div 
                className="absolute inset-0 rounded-full"
                animate={{
                    background: [
                        'radial-gradient(circle at 50% 0%, var(--accent-color) 0%, transparent 40%)',
                        'radial-gradient(circle at 100% 50%, var(--accent-color) 0%, transparent 40%)',
                        'radial-gradient(circle at 50% 100%, var(--accent-color) 0%, transparent 40%)',
                        'radial-gradient(circle at 0% 50%, var(--accent-color) 0%, transparent 40%)',
                        'radial-gradient(circle at 50% 0%, var(--accent-color) 0%, transparent 40%)',
                    ],
                }}
                transition={{
                    duration: 10,
                    repeat: Infinity,
                    ease: "linear",
                }}
            />

            <AnimatePresence mode="wait">
                <motion.div
                    key={validIndex}
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.5 }}
                    transition={{ duration: 0.3, ease: 'easeInOut' }}
                    className="absolute"
                >
                    <ActiveIcon className="w-24 h-24" style={{ color: 'var(--accent-color)' }} />
                </motion.div>
            </AnimatePresence>
        </div>
    );
};


const FeatureCard = ({ feature, index, scrollYProgress }) => {
    const start = index / features.length;
    const end = (index + 1) / features.length;
    const opacity = useTransform(scrollYProgress, [start - 0.1, start, end, end + 0.1], [0.3, 1, 1, 0.3]);
    const scale = useTransform(scrollYProgress, [start - 0.1, start, end, end + 0.1], [0.95, 1, 1, 0.95]);
    const y = useTransform(scrollYProgress, [start - 0.1, start, end, end + 0.1], ["16px", "0px", "0px", "-16px"]);
    const highlightScaleY = useTransform(scrollYProgress, [start, end], [0, 1]);

    return (
        <motion.div style={{ opacity, scale, y }} className="feature-card relative pl-8">
            <motion.div
                className="absolute left-0 top-0 bottom-0 w-1 rounded-full"
                style={{ scaleY: highlightScaleY, backgroundColor: 'var(--accent-color)', transformOrigin: 'top' }}
            />
            <feature.Icon className="w-8 h-8 mb-4" style={{ color: 'var(--accent-color)' }}/>
            <h3 className="text-3xl font-bold mb-2" style={{ color: 'var(--text-color)' }}>{feature.title}</h3>
            <p className="text-lg text-slate-500 dark:text-slate-400">{feature.description}</p>
        </motion.div>
    );
};

// --- Main Landing Page Component ---
const LandingPage = ({ onNavigate }) => {
    const [isDarkMode, setIsDarkMode] = useState(true);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const featuresRef = useRef(null);
    
    // Adjusted useScroll offset for better synchronization
    const { scrollYProgress } = useScroll({ 
        target: featuresRef, 
        offset: ["start 0.5", "end 0.5"] 
    });
    
    const [activeFeatureIndex, setActiveFeatureIndex] = useState(0);

    const rotateX = useTransform(scrollYProgress, [0, 1], [15, -15]);
    const rotateY = useTransform(scrollYProgress, [0, 1], [-15, 15]);

    useEffect(() => {
        const unsubscribe = scrollYProgress.on("change", (latest) => {
            const newIndex = Math.floor(latest * features.length);
            setActiveFeatureIndex(newIndex);
        });
        return () => unsubscribe();
    }, [scrollYProgress]);

    useEffect(() => {
        document.documentElement.classList.toggle('dark', isDarkMode);
    }, [isDarkMode]);

    const handleFormSubmit = (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData.entries());
        console.log("Form submitted:", data);
        // A non-blocking alert for better user experience
        setTimeout(() => alert("Thank you for your message!"), 0);
        e.target.reset();
    };

    return (
        <>
            <style>{`
                :root {
                    --bg-color: #E0E5EC; --text-color: #374151; --shadow-light: #FFFFFF;
                    --shadow-dark: #A3B1C6; --accent-color: #4F46E5; --ring-color: var(--accent-color);
                }
                .dark {
                    --bg-color: #1a1a1a; --text-color: #E5E7EB; --shadow-light: #242424;
                    --shadow-dark: #101010; --accent-color: #818CF8; --ring-color: var(--accent-color);
                }
                body {
                    background-color: var(--bg-color); color: var(--text-color);
                    font-family: 'Inter', sans-serif; overflow-x: hidden;
                }
                .neumorphic-outset {
                    background: var(--bg-color);
                    box-shadow: 8px 8px 16px var(--shadow-dark), -8px -8px 16px var(--shadow-light);
                    transition: all 0.3s ease-in-out;
                }
                .neumorphic-inset {
                    background: var(--bg-color);
                    box-shadow: inset 8px 8px 16px var(--shadow-dark), inset -8px -8px 16px var(--shadow-light);
                }
                .neumorphic-input {
                    background-color: transparent; color: var(--text-color);
                    box-shadow: inset 4px 4px 8px var(--shadow-dark), inset -4px -4px 8px var(--shadow-light);
                    transition: box-shadow 0.3s ease; appearance: none; border: none; outline: none;
                }
                .neumorphic-outset:hover { transform: translateY(-5px); box-shadow: 12px 12px 24px var(--shadow-dark), -12px -12px 24px var(--shadow-light); }
                .neumorphic-button:active { box-shadow: inset 6px 6px 12px var(--shadow-dark), inset -6px -6px 12px var(--shadow-light); }
                .section-title { color: var(--accent-color); }
                .focus\\:ring-custom:focus { --tw-ring-color: var(--ring-color); }
            `}</style>

            <header className="fixed top-0 left-0 right-0 z-50">
                <nav className="container mx-auto px-4 sm:px-6 py-3 flex justify-between items-center neumorphic-outset mt-4 rounded-full">
                     <div className="flex-1 flex justify-start">
                        <a href="#top" className="flex items-center space-x-2">
                            <GraduationCap style={{ color: 'var(--accent-color)' }} />
                            <span className="text-xl font-bold" style={{ color: 'var(--text-color)' }}>Atrack</span>
                        </a>
                    </div>
                    <div className="hidden md:flex items-center justify-center space-x-8">
                        <a href="#features" className="font-medium hover:text-indigo-600 dark:hover:text-indigo-400 transition">Features</a>
                        <a href="#reviews" className="font-medium hover:text-indigo-600 dark:hover:text-indigo-400 transition">Reviews</a>
                        <a href="#contact" className="font-medium hover:text-indigo-600 dark:hover:text-indigo-400 transition">Contact</a>
                    </div>
                    <div className="flex-1 flex justify-end items-center space-x-2">
                        <NeumorphicButton onClick={() => setIsDarkMode(!isDarkMode)} className="w-10 h-10 rounded-full flex items-center justify-center">
                            {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
                        </NeumorphicButton>
                        <button onClick={onNavigate} className="neumorphic-outset neumorphic-button text-white font-semibold px-5 py-2.5 rounded-full hidden sm:block" style={{ backgroundColor: 'var(--accent-color)', color: 'white' }}>Login</button>
                        <button onClick={() => setIsMobileMenuOpen(true)} aria-label="Open menu" className="md:hidden neumorphic-outset neumorphic-button w-10 h-10 rounded-full flex items-center justify-center">
                            <Menu />
                        </button>
                    </div>
                </nav>
                <AnimatePresence>
                     {isMobileMenuOpen && (
                        <motion.div 
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={() => setIsMobileMenuOpen(false)}>
                            <motion.div 
                                initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }}
                                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                                className="absolute top-0 left-0 bottom-0 w-64 p-4" onClick={(e) => e.stopPropagation()}>
                                <div className="neumorphic-outset rounded-2xl p-4 flex flex-col space-y-2 h-full">
                                    <button onClick={() => setIsMobileMenuOpen(false)} className="self-end p-2"><X /></button>
                                    <a href="#features" onClick={() => setIsMobileMenuOpen(false)} className="hover:bg-gray-200 dark:hover:bg-gray-700/60 p-2 rounded-lg transition">Features</a>
                                    <a href="#reviews" onClick={() => setIsMobileMenuOpen(false)} className="hover:bg-gray-200 dark:hover:bg-gray-700/60 p-2 rounded-lg transition">Reviews</a>
                                    <a href="#contact" onClick={() => setIsMobileMenuOpen(false)} className="hover:bg-gray-200 dark:hover:bg-gray-700/60 p-2 rounded-lg transition">Contact</a>
                                    <button onClick={onNavigate} className="mt-auto text-white font-semibold text-center p-3 rounded-lg" style={{ backgroundColor: 'var(--accent-color)' }}>Get Started</button>
                                </div>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </header>

            <main className="relative pt-32 pb-20 md:pt-48 md:pb-32">
                <motion.div 
                    initial="hidden" animate="show"
                    variants={{ show: { transition: { staggerChildren: 0.2 } } }}
                    className="container mx-auto px-6 text-center">
                    <motion.h1 variants={FADE_UP_ANIMATION_VARIANTS} className="text-4xl md:text-6xl lg:text-7xl font-extrabold leading-tight mb-4">
                        Your Semester, Simplified.
                    </motion.h1>
                    <motion.p variants={FADE_UP_ANIMATION_VARIANTS} className="text-lg md:text-xl max-w-3xl mx-auto mb-8">
                        Atrack is the academic OS you've always wanted. It intelligently organizes your deadlines, grades, and attendance, transforming overwhelming data into a strategic advantage for a successful semester.
                    </motion.p>
                    <motion.div variants={FADE_UP_ANIMATION_VARIANTS} className="flex justify-center">
                        <button onClick={onNavigate} className="neumorphic-outset neumorphic-button text-white font-bold px-8 py-4 rounded-full text-lg flex items-center gap-2" style={{backgroundColor: 'var(--accent-color)', color: 'white'}}>
                            Get Started Free <ArrowRight/>
                        </button>
                    </motion.div>
                </motion.div>
            </main>
            
            <section id="features" ref={featuresRef} className="py-24 md:py-32 relative">
                 <div className="container mx-auto px-6">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl md:text-5xl font-bold section-title">One App. Every Angle Covered.</h2>
                        <p className="text-lg mt-4 max-w-2xl mx-auto text-slate-500 dark:text-slate-400">
                            Stop juggling a dozen apps. Your entire semester finally has one home.
                        </p>
                        <div className="w-full max-w-xl mx-auto mt-8 neumorphic-inset rounded-full h-2">
                            <motion.div className="h-full rounded-full" style={{ scaleX: scrollYProgress, transformOrigin: 'left', background: 'var(--accent-color)' }} />
                        </div>
                    </div>
                    <div className="md:grid md:grid-cols-2 lg:grid-cols-5 md:gap-16 items-start">
                        <div className="md:col-span-1 lg:col-span-2 md:sticky md:top-32 mb-16 md:mb-0" style={{ perspective: '1000px' }}>
                            <motion.div className="neumorphic-outset rounded-full p-4" style={{ rotateX, rotateY }}>
                                <div className="neumorphic-inset rounded-full aspect-square overflow-hidden relative">
                                    <FeatureDisplay activeIndex={activeFeatureIndex} />
                                </div>
                            </motion.div>
                        </div>
                        <div className="md:col-span-1 lg:col-span-3 space-y-48 md:space-y-64 lg:space-y-72">
                            {features.map((feature, index) => (
                                <FeatureCard key={feature.title} feature={feature} index={index} scrollYProgress={scrollYProgress} />
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            <section id="reviews" className="py-24 md:py-32">
                <div className="container mx-auto px-6">
                    <motion.div initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.2 }} variants={{ show: { transition: { staggerChildren: 0.1 } } }} className="text-center mb-16">
                        <motion.h2 variants={FADE_UP_ANIMATION_VARIANTS} className="text-4xl md:text-5xl font-bold section-title">Loved by Students</motion.h2>
                        <motion.p variants={FADE_UP_ANIMATION_VARIANTS} className="text-lg mt-4 max-w-2xl mx-auto text-slate-500 dark:text-slate-400">See what fellow students are saying about Atrack.</motion.p>
                    </motion.div>
                    <motion.div initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.1 }} variants={{ show: { transition: { staggerChildren: 0.15 } } }} className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {testimonials.map((testimonial, index) => (
                            <NeumorphicCard 
                                key={index} 
                                variants={FADE_UP_ANIMATION_VARIANTS} 
                                // --- FIX: Added classes to make card black in light mode ---
                                className="!bg-black dark:!bg-[--bg-color]"
                            >
                                <div className="flex items-center mb-4"><span className="text-yellow-400">★★★★★</span></div>
                                {/* --- FIX: Text is now white in both modes to contrast with the new card background --- */}
                                <p className="mb-4 text-white">"{testimonial.quote}"</p>
                                <p className="font-bold text-white">- {testimonial.author}, <span className="text-gray-300 dark:text-gray-400 font-normal">{testimonial.role}</span></p>
                            </NeumorphicCard>
                        ))}
                    </motion.div>
                </div>
            </section>

            <section id="feedback" className="py-24 md:py-32">
                <div className="container mx-auto px-6">
                    <NeumorphicCard className="text-center !p-12">
                         <motion.div initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.3 }} variants={{ show: { transition: { staggerChildren: 0.2 } } }}>
                            <motion.div variants={FADE_UP_ANIMATION_VARIANTS} className="flex justify-center mb-4">
                                <div className="neumorphic-inset rounded-full p-4">
                                    <Lightbulb className="w-10 h-10" style={{ color: 'var(--accent-color)' }} />
                                </div>
                            </motion.div>
                            <motion.h2 variants={FADE_UP_ANIMATION_VARIANTS} className="text-3xl md:text-4xl font-bold section-title mb-4">Have a brilliant idea?</motion.h2>
                            <motion.p variants={FADE_UP_ANIMATION_VARIANTS} className="text-lg max-w-2xl mx-auto text-slate-500 dark:text-slate-400 mb-8">
                                We're constantly improving Atrack with features requested by students like you. Share your suggestions!
                            </motion.p>
                            <motion.form variants={FADE_UP_ANIMATION_VARIANTS} onSubmit={handleFormSubmit} className="flex flex-col sm:flex-row gap-4 max-w-xl mx-auto">
                                <NeumorphicInput name="suggestion" type="text" placeholder="Your suggestion..." className="flex-grow" required />
                                <NeumorphicButton type="submit" className="font-semibold px-6 py-3 rounded-lg flex items-center justify-center gap-2" style={{ backgroundColor: 'var(--accent-color)', color: 'white' }}>
                                    Send Idea <Send size={18} />
                                </NeumorphicButton>
                            </motion.form>
                         </motion.div>
                    </NeumorphicCard>
                </div>
            </section>
            
            <footer id="contact" className="pt-24 pb-12 border-t" style={{borderColor: 'var(--shadow-dark)'}}>
                <div className="container mx-auto px-6">
                    <div className="grid md:grid-cols-2 gap-16 mb-12">
                        <motion.div initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.2 }} variants={{ show: { transition: { staggerChildren: 0.2 } } }}>
                            <motion.div variants={FADE_UP_ANIMATION_VARIANTS} className="flex items-center space-x-3 mb-4">
                                <GraduationCap size={32} style={{ color: 'var(--accent-color)' }} />
                                <span className="text-3xl font-bold" style={{ color: 'var(--text-color)' }}>Atrack</span>
                            </motion.div>
                            <motion.p variants={FADE_UP_ANIMATION_VARIANTS} className="text-slate-500 dark:text-slate-400 mb-6 max-w-md">
                                The ultimate academic toolkit, built for students, by students. Streamline your studies and unlock your full potential.
                            </motion.p>
                            <motion.div variants={FADE_UP_ANIMATION_VARIANTS} className="flex space-x-4">
                                <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" aria-label="Twitter" className="neumorphic-outset neumorphic-button w-10 h-10 rounded-full flex items-center justify-center"><Twitter size={20} /></a>
                                <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" className="neumorphic-outset neumorphic-button w-10 h-10 rounded-full flex items-center justify-center"><Linkedin size={20} /></a>
                                <a href="https://github.com" target="_blank" rel="noopener noreferrer" aria-label="GitHub" className="neumorphic-outset neumorphic-button w-10 h-10 rounded-full flex items-center justify-center"><Github size={20} /></a>
                            </motion.div>
                        </motion.div>
                        
                        <motion.form onSubmit={handleFormSubmit} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.2 }} variants={{ show: { transition: { staggerChildren: 0.15 } } }}>
                            <motion.h3 variants={FADE_UP_ANIMATION_VARIANTS} className="text-2xl font-bold mb-6 flex items-center gap-3"><Mail size={24}/> Get in Touch</motion.h3>
                            <motion.div variants={FADE_UP_ANIMATION_VARIANTS} className="space-y-4">
                                <NeumorphicInput name="name" type="text" placeholder="Your Name" required />
                                <NeumorphicInput name="email" type="email" placeholder="Your Email" required />
                                <NeumorphicTextarea name="message" placeholder="Your Message" required />
                                <NeumorphicButton type="submit" className="w-full font-bold py-3 text-lg rounded-lg" style={{ backgroundColor: 'var(--accent-color)', color: 'white' }}>
                                    Send Message
                                </NeumorphicButton>
                            </motion.div>
                        </motion.form>
                    </div>
                    <div className="text-center text-slate-500 dark:text-slate-500 pt-8 border-t" style={{borderColor: 'var(--shadow-dark)'}}>
                        <p>&copy; {new Date().getFullYear()} Atrack. All rights reserved. Made with ❤️ in Jabalpur.</p>
                    </div>
                </div>
            </footer>
        </>
    );
};

export default LandingPage;
