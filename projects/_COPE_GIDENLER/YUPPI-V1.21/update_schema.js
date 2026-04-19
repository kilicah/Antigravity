const fs = require('fs');
const content = fs.readFileSync('prisma/schema.prisma', 'utf8');
const replacement = `model SystemConfig {
  id             Int      @id @default(1)
  commissionRate Float    @default(1.05)
  freightCost    Float    @default(0.20)
  usdToGbpRate   Float    @default(1.25)
  usdToEurRate   Float    @default(1.08)
  baseTier       String   @default("T2")
  
  usdToTryRate   Float    @default(50.00)
  usdFreight     Float    @default(0.0)
  gbpFreight     Float    @default(0.20)
  eurFreight     Float    @default(0.25)
  tryFreight     Float    @default(0.0)
  usdCommission  Float    @default(0.0)
  gbpCommission  Float    @default(5.0)
  eurCommission  Float    @default(0.0)
  tryCommission  Float    @default(0.0)

  updatedAt      DateTime @updatedAt
}`;

// Find model SystemConfig and replace it up to the next brace
const regex = /model SystemConfig\s*\{[^}]+\}/;
fs.writeFileSync('prisma/schema.prisma', content.replace(regex, replacement));
console.log('Schema updated.');
