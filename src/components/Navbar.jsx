import styled from 'styled-components';
import { motion } from 'framer-motion';
import DiceLogo from '@assets/dice-logo.svg';

// Change from motion.create to styled(motion.nav)
const NavbarContainer = styled(motion.nav)`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
  padding: 1rem 2rem;
  background: ${({ theme }) => theme.background};
  border-bottom: 1px solid ${({ theme }) => theme.border};
  backdrop-filter: blur(10px);
`;

// Rest of your Navbar component code... 