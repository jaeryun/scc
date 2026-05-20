'use client'

import { useQuery } from '@tanstack/react-query'
import { switchDetailOptions, switchesByRoleOptions } from '../api/queries'

export function useSwitchPorts(deviceId: string) {
  return useQuery(switchDetailOptions(deviceId))
}

export function useSwitchesByRole(role: string) {
  return useQuery(switchesByRoleOptions(role))
}
