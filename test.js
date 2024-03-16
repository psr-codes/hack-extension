function extractNumericalNumberofPrice(str) {
  return str.replace(/\D/g, "");
  
}

val = extractNumericalNumberofPrice("₹10,099");

console.log(val);
