import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { useParams } from 'react-router-dom';
import { ProfileStats } from '../components/profile/ProfileStats';
import { GameHistory } from '../components/profile/GameHistory';
import { useProfile } from '../hooks/useProfile';

const ProfileContainer = styled(motion.div)`
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
`;

export function ProfilePage() {
  const { address } = useParams();
  const { data, isLoading, error } = useProfile(address);

  return (
    <ProfileContainer
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <h1>Player Profile</h1>
      <ProfileStats data={data} isLoading={isLoading} error={error} />
      <GameHistory address={address} />
    </ProfileContainer>
  );
}

export default ProfilePage; 