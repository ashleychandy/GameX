import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useWallet } from '@/contexts/WalletContext';
import { ethers } from 'ethers';
import { Button } from '@/components/common';
import { GAME_TOKEN_ABI } from '@/contracts/abis';
import { formatAmount } from '@/utils/helpers';

// ... [Keep all the styled components from original HomePage.jsx]

const HomePage = () => {
    // ... [Keep all the component logic from original HomePage.jsx]
};

export default HomePage; 