export function formatPhoneNumber(phone: string | null | undefined): string {
  if (!phone) return '';
  
  // Remove all non-numeric characters for processing
  const clean = phone.replace(/\D/g, '');
  
  // Handle Indian phone numbers (12 digits starting with 91)
  if (clean.length === 12 && clean.startsWith('91')) {
    return `+91 ${clean.slice(2)}`;
  }
  
  // Handle US/Canada phone numbers (11 digits starting with 1)
  if (clean.length === 11 && clean.startsWith('1')) {
    return `+1 ${clean.slice(1, 4)}-${clean.slice(4, 7)}-${clean.slice(7)}`;
  }
  
  // Handle UK phone numbers (44 + 10 digits)
  if (clean.length === 12 && clean.startsWith('44')) {
    return `+44 ${clean.slice(2, 6)} ${clean.slice(6)}`;
  }
  
  // For any other country code, if it doesn't already have a plus, just add it.
  // E.g. 62811222333 -> +62811222333
  if (clean.length > 8 && !phone.startsWith('+')) {
    return `+${clean}`;
  }
  
  // Return as is if it's too short or already formatted differently
  return phone;
}
