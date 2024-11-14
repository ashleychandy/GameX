import React from 'react';
import { DiceGame } from '@/components/game/DiceGame';
import { ProtectedRoute } from '@/components/common/ProtectedRoute';

export function DicePage() {
  return (
    <ProtectedRoute>
      <DiceGame />
    </ProtectedRoute>
  );
} 