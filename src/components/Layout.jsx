// src/components/Layout.jsx
import React, { useEffect, useState, useRef } from "react";
import PropTypes from "prop-types";
import styled from "styled-components";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useLocation, Outlet, useNavigate } from "react-router-dom";
import { Button } from "./common/Button";
import { useWallet } from "../contexts/WalletContext";
import { formatAddress, formatAmount } from "../utils/helpers";
import { toast } from "react-toastify";
import { getRouteMetadata } from "../routes";
import { useTheme } from "../contexts/ThemeContext";
import {
  FiMenu,
  FiX,
  FiSun,
  FiMoon,
  FiUser,
  FiSettings,
  FiLogOut,
} from "react-icons/fi";

// Animation variants
const mobileMenuVariants = {
  hidden: {
    opacity: 0,
    height: 0,
    transition: { duration: 0.2 },
  },
  visible: {
    opacity: 1,
    height: "auto",
    transition: { duration: 0.2 },
  },
};

const menuItemVariants = {
  hidden: {
    opacity: 0,
    x: -20,
  },
  visible: {
    opacity: 1,
    x: 0,
  },
};

// Layout Container
const LayoutContainer = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: ${({ theme }) => theme.background};
  color: ${({ theme }) => theme.text.primary};
`;

// Header Components
const Header = styled.header`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 2rem;
  background: ${({ theme }) => theme.surface};
  box-shadow: ${({ theme }) => theme.shadow.sm};
  z-index: 100;

  @media (max-width: 768px) {
    padding: 1rem;
  }
`;

const HeaderLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const HeaderRight = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;

  @media (max-width: 768px) {
    gap: 0.5rem;
  }
`;

const HeaderTitle = styled.h1`
  font-size: 1.5rem;
  color: ${({ theme }) => theme.text.primary};
  background: ${({ theme }) => theme.gradients.primary};
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin: 0;
`;

// Navbar Components
const Nav = styled(motion.nav)`
  background: ${({ theme }) => `${theme.surface}CC`};
  backdrop-filter: blur(8px);
  border-bottom: 1px solid ${({ theme }) => `${theme.border}50`};
  padding: 1rem 2rem;
  position: sticky;
  width: 100%;
  top: 0;
  z-index: 1000;
  box-shadow: 0 2px 8px ${({ theme }) => `${theme.shadow}20`};

  @media (max-width: 768px) {
    padding: 0.5rem 1rem;
  }
`;

const NavContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 2rem;

  @media (max-width: 768px) {
    gap: 1rem;
  }
`;

const NavLinks = styled.div`
  display: flex;
  gap: 2rem;
  align-items: center;

  @media (max-width: 768px) {
    display: none;
  }
`;

const MobileNavLinks = styled(motion.div)`
  display: none;

  @media (max-width: 768px) {
    display: flex;
    flex-direction: column;
    position: fixed;
    top: 60px;
    left: 0;
    right: 0;
    background: ${({ theme }) => theme.surface};
    padding: 1rem;
    gap: 1rem;
    border-bottom: 1px solid ${({ theme }) => theme.border};
  }
`;

const Logo = styled(Link)`
  font-size: 1.5rem;
  font-weight: 700;
  color: ${({ theme }) => theme.text.primary};
  text-decoration: none;
  display: flex;
  align-items: center;
  gap: 0.5rem;

  span {
    background: ${({ theme }) => theme.gradients.primary};
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }

  @media (max-width: 768px) {
    font-size: 1.25rem;
  }
`;

const StyledNavLink = styled(motion(Link))`
  color: ${({ theme, $active }) =>
    $active ? theme.primary : theme.text.secondary};
  text-decoration: none;
  font-weight: 500;
  position: relative;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  transition: all 0.2s ease;

  &:hover {
    background: ${({ theme }) => `${theme.primary}10`};
    color: ${({ theme }) => theme.primary};
  }

  ${({ $active, theme }) =>
    $active &&
    `
    background: ${theme.primary}15;
    color: ${theme.primary};
  `}

  @media (max-width: 768px) {
    width: 100%;
    text-align: center;
  }
`;

const MenuButton = styled.button`
  display: none;
  background: none;
  border: none;
  color: ${({ theme }) => theme.text.primary};
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 8px;

  @media (max-width: 768px) {
    display: flex;
    align-items: center;
    justify-content: center;
  }

  &:hover {
    background: ${({ theme }) => `${theme.primary}10`};
  }
`;

const WalletInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: stretch;
  }
`;

const WalletBalance = styled.span`
  color: ${({ theme }) => theme.text.secondary};
  font-weight: 500;
  white-space: nowrap;
`;

const WalletAddress = styled.span`
  color: ${({ theme }) => theme.primary};
  cursor: pointer;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  background: ${({ theme }) => `${theme.primary}10`};

  &:hover {
    background: ${({ theme }) => `${theme.primary}20`};
  }
`;

const ThemeToggle = styled.button`
  background: none;
  border: none;
  color: ${({ theme }) => theme.text.primary};
  cursor: pointer;
  padding: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;

  &:hover {
    background: ${({ theme }) => `${theme.primary}10`};
  }
`;

// User Menu Components
const UserMenuContainer = styled.div`
  position: relative;
`;

const UserMenuButton = styled.button`
  background: none;
  border: none;
  color: ${({ theme }) => theme.text.primary};
  cursor: pointer;
  padding: 0.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  border-radius: 8px;

  &:hover {
    background: ${({ theme }) => `${theme.primary}10`};
  }
`;

const UserMenuDropdown = styled(motion.div)`
  position: absolute;
  top: calc(100% + 0.5rem);
  right: 0;
  background: ${({ theme }) => theme.surface};
  border-radius: 8px;
  box-shadow: ${({ theme }) => theme.shadow.lg};
  padding: 0.5rem;
  min-width: 200px;
  z-index: 1000;
  border: 1px solid ${({ theme }) => theme.border};
`;

const UserMenuItem = styled.button`
  width: 100%;
  padding: 0.5rem 1rem;
  background: none;
  border: none;
  color: ${({ theme }) => theme.text.primary};
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  border-radius: 4px;
  transition: all 0.2s ease;

  &:hover {
    background: ${({ theme }) => `${theme.primary}10`};
  }

  &:focus {
    outline: none;
    box-shadow: 0 0 0 2px ${({ theme }) => `${theme.primary}40`};
  }
`;

// Footer Components
const FooterContainer = styled.footer`
  padding: 2rem;
  background: ${({ theme }) => theme.surface};
  color: ${({ theme }) => theme.text.secondary};
  box-shadow: ${({ theme }) => theme.shadow.sm};

  @media (max-width: 768px) {
    padding: 1rem;
  }
`;

const FooterContent = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
`;

const FooterSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const FooterTitle = styled.h3`
  color: ${({ theme }) => theme.text.primary};
  margin: 0;
`;

const FooterLink = styled(Link)`
  color: ${({ theme }) => theme.text.secondary};
  text-decoration: none;
  transition: color 0.2s ease;

  &:hover {
    color: ${({ theme }) => theme.primary};
  }
`;

const FooterBottom = styled.div`
  margin-top: 2rem;
  padding-top: 1rem;
  border-top: 1px solid ${({ theme }) => theme.border};
  text-align: center;
`;

// Main Content
const Main = styled.main`
  flex: 1;
  background: ${({ theme }) => theme.background};
  padding: 2rem;

  @media (max-width: 768px) {
    padding: 1rem;
  }
`;

// User Menu Component
function UserMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);
  const { user, logout } = useWallet();
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    const handleEscape = (event) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  const handleMenuItemClick = (action) => {
    setIsOpen(false);
    action();
  };

  return (
    <UserMenuContainer ref={menuRef}>
      <UserMenuButton
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <FiUser />
        {user?.name}
      </UserMenuButton>
      <AnimatePresence>
        {isOpen && (
          <UserMenuDropdown
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.2 }}
          >
            <UserMenuItem
              onClick={() => handleMenuItemClick(() => navigate("/profile"))}
            >
              <FiUser /> Profile
            </UserMenuItem>
            <UserMenuItem
              onClick={() => handleMenuItemClick(() => navigate("/settings"))}
            >
              <FiSettings /> Settings
            </UserMenuItem>
            <UserMenuItem onClick={() => handleMenuItemClick(logout)}>
              <FiLogOut /> Logout
            </UserMenuItem>
          </UserMenuDropdown>
        )}
      </AnimatePresence>
    </UserMenuContainer>
  );
}

// Navbar Component
function Navbar() {
  const location = useLocation();
  const { isDarkMode, toggleTheme } = useTheme();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const {
    isConnected,
    isConnecting,
    address,
    balance,
    connectWallet,
    disconnectWallet,
  } = useWallet();

  useEffect(() => {
    const handleKeyPress = (event) => {
      if (event.key === "Escape" && isMobileMenuOpen) {
        setIsMobileMenuOpen(false);
      }
    };

    document.addEventListener("keydown", handleKeyPress);
    return () => document.removeEventListener("keydown", handleKeyPress);
  }, [isMobileMenuOpen]);

  const handleConnect = async () => {
    try {
      await connectWallet();
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleDisconnect = () => {
    disconnectWallet();
    toast.success("Wallet disconnected");
  };

  const handleAddressClick = () => {
    navigator.clipboard.writeText(address);
    toast.success("Address copied to clipboard!");
  };

  return (
    <Nav
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <NavContainer>
        <HeaderLeft>
          <Logo to="/">
            <span>GameX</span>Platform
          </Logo>
          <NavLinks>
            <StyledNavLink
              to="/"
              $active={location.pathname === "/"}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Home
            </StyledNavLink>
            <StyledNavLink
              to="/dice"
              $active={location.pathname === "/dice"}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Dice Game
            </StyledNavLink>
          </NavLinks>
        </HeaderLeft>

        <HeaderRight>
          <ThemeToggle
            onClick={toggleTheme}
            aria-label={
              isDarkMode ? "Switch to light mode" : "Switch to dark mode"
            }
          >
            {isDarkMode ? <FiSun size={20} /> : <FiMoon size={20} />}
          </ThemeToggle>

          <WalletInfo>
            {isConnected ? (
              <>
                <WalletBalance>{formatAmount(balance)} GameX</WalletBalance>
                <WalletAddress
                  onClick={handleAddressClick}
                  title="Click to copy address"
                >
                  {formatAddress(address)}
                </WalletAddress>
                <Button
                  onClick={handleDisconnect}
                  disabled={isConnecting}
                  variant="secondary"
                >
                  Disconnect
                </Button>
              </>
            ) : (
              <Button
                onClick={handleConnect}
                disabled={isConnecting}
                variant="primary"
              >
                {isConnecting ? "Connecting..." : "Connect Wallet"}
              </Button>
            )}
          </WalletInfo>

          {isConnected && <UserMenu />}

          <MenuButton
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
            aria-expanded={isMobileMenuOpen}
          >
            {isMobileMenuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
          </MenuButton>
        </HeaderRight>
      </NavContainer>

      <AnimatePresence>
        {isMobileMenuOpen && (
          <MobileNavLinks
            variants={mobileMenuVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
          >
            <StyledNavLink
              to="/"
              $active={location.pathname === "/"}
              onClick={() => setIsMobileMenuOpen(false)}
              variants={menuItemVariants}
            >
              Home
            </StyledNavLink>
            <StyledNavLink
              to="/dice"
              $active={location.pathname === "/dice"}
              onClick={() => setIsMobileMenuOpen(false)}
              variants={menuItemVariants}
            >
              Dice Game
            </StyledNavLink>
          </MobileNavLinks>
        )}
      </AnimatePresence>
    </Nav>
  );
}

// Footer Component
function Footer() {
  return (
    <FooterContainer>
      <FooterContent>
        <FooterSection>
          <FooterTitle>About GameX</FooterTitle>
          <FooterLink to="/about">About Us</FooterLink>
          <FooterLink to="/team">Our Team</FooterLink>
          <FooterLink to="/careers">Careers</FooterLink>
        </FooterSection>

        <FooterSection>
          <FooterTitle>Resources</FooterTitle>
          <FooterLink to="/docs">Documentation</FooterLink>
          <FooterLink to="/blog">Blog</FooterLink>
          <FooterLink to="/faq">FAQ</FooterLink>
        </FooterSection>

        <FooterSection>
          <FooterTitle>Legal</FooterTitle>
          <FooterLink to="/privacy">Privacy Policy</FooterLink>
          <FooterLink to="/terms">Terms of Service</FooterLink>
          <FooterLink to="/cookies">Cookie Policy</FooterLink>
        </FooterSection>

        <FooterSection>
          <FooterTitle>Connect</FooterTitle>
          <FooterLink
            to="https://discord.gg/gamex"
            target="_blank"
            rel="noopener noreferrer"
          >
            Discord
          </FooterLink>
          <FooterLink
            to="https://twitter.com/gamex"
            target="_blank"
            rel="noopener noreferrer"
          >
            Twitter
          </FooterLink>
          <FooterLink
            to="https://t.me/gamex"
            target="_blank"
            rel="noopener noreferrer"
          >
            Telegram
          </FooterLink>
        </FooterSection>
      </FooterContent>

      <FooterBottom>
        <p>© {new Date().getFullYear()} GameX Platform. All rights reserved.</p>
      </FooterBottom>
    </FooterContainer>
  );
}

// Main Layout Component
function Layout() {
  const location = useLocation();

  useEffect(() => {
    const { title } = getRouteMetadata(location.pathname);
    if (title) {
      document.title = `${title} | GameX`;
    }
  }, [location]);

  return (
    <LayoutContainer>
      <Navbar />
      <Main>
        <Outlet />
      </Main>
      <Footer />
    </LayoutContainer>
  );
}

// PropTypes
Layout.propTypes = {
  children: PropTypes.node,
};

Navbar.propTypes = {
  onMenuClick: PropTypes.func,
};

UserMenu.propTypes = {
  user: PropTypes.shape({
    name: PropTypes.string,
    avatar: PropTypes.string,
  }),
  onLogout: PropTypes.func,
};

Footer.propTypes = {
  className: PropTypes.string,
};

// Export components and animations
export const layoutAnimations = {
  mobileMenuVariants,
  menuItemVariants,
};

export { Layout, Navbar, Footer, UserMenu };
