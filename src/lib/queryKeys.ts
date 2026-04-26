export const queryKeys = {
  links: () => ['links'] as const,
  earnings: () => ['earnings'] as const,
  portfolio: () => ['portfolio'] as const,
  history: (page: number) => ['history', page] as const,
  publicLink: (linkId: string) => ['publicLink', linkId] as const,
}