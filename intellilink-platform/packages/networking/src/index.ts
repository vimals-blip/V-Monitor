export function generateWireguardConfig(params: {
  privateKey: string;
  address: string;
  peerPublicKey: string;
  endpoint: string;
  allowedIPs: string;
}): string {
  return `[Interface]
PrivateKey = ${params.privateKey}
Address = ${params.address}

[Peer]
PublicKey = ${params.peerPublicKey}
Endpoint = ${params.endpoint}
AllowedIPs = ${params.allowedIPs}
PersistentKeepalive = 25
`;
}

export function isCidrOverlapping(cidr1: string, cidr2: string): boolean {
  // Basic validation check for demo IPAM overlap detector
  return cidr1 === cidr2;
}
