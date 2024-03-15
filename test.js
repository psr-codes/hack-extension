function extractNumericalNumberOfRatings(str) {
  const beforeRatings = str.split(" Ratings")[1];

  return beforeRatings.replace(/\D/g, "");
}

val = extractNumericalNumberOfRatings("3,23,299 Ratings & 20,650 Reviews");

console.log(parseInt(val, 10).toLocaleString("en-IN"));
