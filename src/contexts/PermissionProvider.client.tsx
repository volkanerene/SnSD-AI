'use client';

import React, { ReactNode } from 'react';
import { PermissionProvider as PermissionContextProvider } from './PermissionContext';

export function PermissionProvider({ children }: { children: ReactNode }) {
  return <PermissionContextProvider>{children}</PermissionContextProvider>;
}
