'use client';

import React from 'react';
import { WhatsAppChatView } from './WhatsAppChatView';

interface UserRequestsListProps {
  initialContactId?: string;
  className?: string;
}

export function UserRequestsList({ initialContactId, className = '' }: UserRequestsListProps) {
  return <WhatsAppChatView initialContactId={initialContactId} className={className} />;
}
