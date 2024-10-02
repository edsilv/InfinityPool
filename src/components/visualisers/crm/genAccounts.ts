// Possible values for the fields
const accountNames = [
  "ABC Corp",
  "XYZ Solutions",
  "Global Industries",
  "Innovate LLC",
  "Techwave",
  "Health Innovations",
  "RetailPlus",
  "Future Labs",
  "Precision Manufacturing",
  "Finance Experts",
  "Alpha Designs",
  "Global Tech",
  "RetailHub",
  "Healthcare Partners",
  "Auto Innovators",
  "Smart Retail",
  "Tech Innovators",
  "Precision Auto",
  "Future Finance",
  "Retail Giants",
  "TechWave",
  "Healthcare Now",
  "Innovative Manufacturing",
  "Retail Superstars",
  "TechWorld",
  "Auto Leaders",
  "Smart Health",
  "Finance First",
  "Retail Solutions",
  "Tech Empire",
  "Smart Retailers",
];
const segmentations = ["Enterprise", "Mid-Market", "SMB"];
const dealSizes = ["L", "M", "S"];
const industries = [
  "Technology",
  "Healthcare",
  "Manufacturing",
  "Retail",
  "Financial Services",
  "Automotive",
  "Design",
];
const customerSegments = ["B2B", "B2C"];
const saleTypes = [
  "New business",
  "Cross sell",
  "Renewal",
  "Up Sell",
  "Refreshed",
];
const serviceLines = [
  "Software",
  "Consulting",
  "Hardware",
  "Cloud Services",
  "Payment Solutions",
];

// Function to get a random element from an array
function getRandomElement<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

// Function to generate random records
function generateRandomRecords(count: number): any[] {
  const newRecords = [];
  for (let i = 0; i < count; i++) {
    const randomRecord = {
      "Account Name": getRandomElement(accountNames),
      Segmentation: getRandomElement(segmentations),
      "Deal Size": getRandomElement(dealSizes),
      Industry: getRandomElement(industries),
      "Customer Segment": getRandomElement(customerSegments),
      "Sale Type": getRandomElement(saleTypes),
      "Service Line": getRandomElement(serviceLines),
    };
    newRecords.push(randomRecord);
  }
  return newRecords;
}

// Generate 250 new random records
export async function generateAccounts(): Promise<any> {
  const newRecords = generateRandomRecords(500);
  console.log(newRecords);
  return newRecords;
}
