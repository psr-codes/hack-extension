await getHTMLData();
    console.log("product info before score: ", productInfo);
    let score = calculateScore(productInfo);
    alert("Product Score: " + score);