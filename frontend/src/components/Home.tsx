'use client'
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import styles from '@/css/HomePage.module.css';
import { checkIfUserLoggedIn } from '@/utils';

export default function HomePage() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const router = useRouter();

    useEffect(() => {
        const checkLoginStatus = async () => {
            const checkLogin = await checkIfUserLoggedIn();
            setIsLoggedIn(checkLogin?.isLoggedIn);
        };

        checkLoginStatus();

        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                const targetId = this.getAttribute('href');
                console.log(targetId)
                if (targetId === "#") {
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                } else {
                    const targetElement = document.querySelector(targetId);
                    if (targetElement) {
                        targetElement.scrollIntoView({ behavior: 'smooth' });
                    }
                }
            });
        });
    }, []);

    const handleLogin = () => {
        router.push('/login');
    };

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        setIsLoggedIn(false);
        setIsSidebarOpen(false);
        router.push('/');
    };

    const handleDashboard = () => {
        router.push('/dashboard');
        setIsSidebarOpen(false);
    };

    return (
        <div className={styles.container}>
            {/* Navigation */}
            <nav className={`${styles.nav} ${styles.navShadow}`}>
                <div className={styles.navContainer}>
                    <div className={styles.logo}>Event Management</div>

                    {/* Mobile menu button */}
                    <div className={styles.mobileMenuButton}>
                        <button onClick={() => setIsMenuOpen(!isMenuOpen)}>
                            {isMenuOpen ? (
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                                </svg>
                            ) : (
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path>
                                </svg>
                            )}
                        </button>
                    </div>

                    {/* Desktop menu */}
                    <div className={styles.desktopMenu}>
                        <a href="#" className={styles.menuLink}>Home</a>
                        <a href="#features" className={styles.menuLink}>Features</a>
                        <a href="#developer" className={styles.menuLink}>Developer</a>
                    </div>

                    {!isLoggedIn ? (
                        <div className={styles.actionButtons}>
                            <button
                                onClick={handleLogin}
                                className={`${styles.loginButton} ${styles.enhancedButton}`}
                            >
                                Login
                            </button>
                        </div>
                    ) : (
                        <div className={styles.actionButtons}>
                            <div className={styles.group} onClick={toggleSidebar}>
                                <img className={styles.userRoundedImg} src="/usericon.png" alt="User Icon" />
                            </div>
                        </div>
                    )}
                </div>

                {/* Mobile menu */}
                {isMenuOpen && (
                    <div className={`${styles.mobileMenu} ${styles.animateDropdown}`}>
                        <a href="#" className={styles.mobileMenuLink} onClick={() => setIsMenuOpen(false)}>Home</a>
                        <a href="#features" className={styles.mobileMenuLink} onClick={() => setIsMenuOpen(false)}>Features</a>
                        <a href="#developer" className={styles.mobileMenuLink} onClick={() => setIsMenuOpen(false)}>Developer</a>
                        <div className={styles.mobileActionButtons}>
                            {!isLoggedIn ? (
                                <button
                                    onClick={() => {
                                        handleLogin();
                                        setIsMenuOpen(false);
                                    }}
                                    className={`${styles.mobileLoginButton} ${styles.enhancedButton}`}
                                >
                                    Login
                                </button>
                            ) : (
                                <>
                                    <div
                                        onClick={handleDashboard}
                                        className={styles.mobileMenuItem}
                                    >
                                        Dashboard
                                    </div>
                                    <div
                                        onClick={handleLogout}
                                        className={styles.mobileMenuItem}
                                    >
                                        Logout
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                )}
            </nav>

            {/* Sidebar */}
            <div className={`${styles.sidebar} ${isSidebarOpen ? styles.sidebarOpen : ''}`}>
                <div className={styles.sidebarContent}>
                    <button className={styles.sidebarCloseButton} onClick={toggleSidebar}>
                        X
                    </button>
                    <div
                        onClick={handleDashboard}
                        className={styles.sidebarItem}
                    >
                        Dashboard
                    </div>
                    <div
                        onClick={handleLogout}
                        className={styles.sidebarItem}
                    >
                        Logout
                    </div>
                </div>
            </div>

            {/* Hero Section with background animation */}
            <section className={`${styles.heroSection} ${styles.animatedBackground}`}>
                <div className={styles.heroContainer}>
                    <div className={styles.heroContent}>
                        <h1 className={`${styles.heroTitle} ${styles.enhancedTitle}`}>Transform Your Digital Experience</h1>
                        <p className={styles.heroText}>Discover powerful tools to help you organize, track, and manage your events with ease.</p>
                        {/* <button className={styles.ctaButton}>Get Started</button> */}
                    </div>
                    <div className={`${styles.heroImageContainer} ${styles.floatingAnimation}`}>
                        <img src="/emapp.png" alt="Hero" className={`${styles.heroImage} ${styles.enhancedShadow}`} />
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section id="features" className={styles.featuresSection}>
                <div className={styles.featuresContainer}>
                    <h2 className={`${styles.featuresTitle} ${styles.sectionHeading}`}>Our Features</h2>
                    <div className={styles.featuresGrid}>
                        {[
                            { title: 'Guest List Management', desc: 'Easily manage and organize your event attendees in one place.', icon: '📋' },
                            { title: 'Task Scheduling', desc: 'Plan and coordinate all your event tasks with a simple timeline view.', icon: '📅' },
                            { title: 'Budget Analytics', desc: 'Track expenses and get insights with detailed financial reporting tools.', icon: '💰' }
                        ].map((feature, index) => (
                            <div key={index} className={`${styles.featureCard} ${styles.hoverEffect}`}>
                                <div className={styles.featureIcon}>{feature.icon}</div>
                                <h3 className={styles.featureTitle}>{feature.title}</h3>
                                <p className={styles.featureDescription}>{feature.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Developer Section */}
            <section id="developer" className={styles.devSection}>
                <div className={styles.devContainer}>
                    <h2 className={`${styles.devTitle} ${styles.sectionHeading}`}>Developers</h2>
                    <div className={styles.devGrid}>
                        {[
                            { name: 'Raja Mouli Mallareddy', role: 'Lead Developer', text: 'Passionate about creating seamless user experiences, I specialize in frontend architecture and performance optimization for event management systems.', avatar: '/man.png' },
                            { name: 'Chandana Banur Kalmarudappa', role: 'Co-Developer', text: 'With expertise in backend development and database design, I ensure our platform handles complex event logistics with reliability and scalability.', avatar: '/woman.png' },
                            { name: 'Guddu Yadav', role: 'Co-Developer', text: 'My focus on responsive design and cross-platform compatibility ensures our event management tools work flawlessly across all devices and browsers.', avatar: '/boy.png' }
                        ].map((dev, index) => (
                            <div key={index} className={`${styles.devCard} ${styles.elevatedCard}`}>
                                <div className={styles.devHeader}>
                                    <img src={dev.avatar} alt={dev.name} className={styles.devAvatar} />
                                    <div>
                                        <h3 className={styles.devName}>{dev.name}</h3>
                                        <p className={styles.devRole}>{dev.role}</p>
                                    </div>
                                </div>
                                <p className={styles.devText}>&quot;{dev.text}&quot;</p>
                                {/* <div className={styles.socialLinks}>
                                    <a href="#" className={styles.socialIcon}>🔗</a>
                                    <a href="#" className={styles.socialIcon}>👥</a>
                                </div> */}
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className={styles.footer}>
                <div className={styles.footerContainer}>
                    <div className={styles.footerGrid}>
                        <div>
                            <h3 className={styles.footerBrand}>Event Management</h3>
                            <p className={styles.footerDescription}>Empowering your event planning journey with innovative solutions.</p>
                        </div>
                        <div>
                            <h4 className={styles.footerLinkTitle}>Quick Links</h4>
                            <ul className={styles.footerLinks}>
                                <li><a href="#" className={styles.footerLink}>Home</a></li>
                                <li><a href="#features" className={styles.footerLink}>Features</a></li>
                                <li><a href="#developer" className={styles.footerLink}>Developer</a></li>
                                <li><a href="https://github.com/rajamoulislu/event-planning-platform" rel="noopener noreferrer" target="_blank" className={styles.footerLink}>Github &#x2197;</a></li>

                            </ul>
                        </div>
                        <div>
                            <h4 className={styles.footerLinkTitle}>Contact Us</h4>
                            <p className={styles.footerContact}>support@eventmanagement.com</p>
                        </div>
                    </div>
                    <div className={styles.footerDivider}>
                        <p className={styles.footerCopyright}>© {new Date().getFullYear()} Event Management. All rights reserved.</p>
                    </div>
                </div>
            </footer>
        </div>
    );
}