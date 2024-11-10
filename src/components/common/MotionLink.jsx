import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import styled from 'styled-components';

export const MotionLink = styled(motion(Link))`
  text-decoration: none;
  color: inherit;
  display: inline-block;
`; 