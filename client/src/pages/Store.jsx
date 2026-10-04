import React from "react";

const products = [
  {
    name: "Handgrip",
    description:
      "Strengthen your grip with adjustable resistance. Ideal for fitness and therapy.",
    link: "https://www.amazon.in/Boldfit-Adjustable-Hand-Grip-Strengthener/dp/B08G8R7TRM",
    image:
      "https://img.freepik.com/premium-photo/close-up-cropped-hand-holding-handgrip-against-white-background_1048944-30533710.jpg",
  },
  {
    name: "Protein Powder",
    description: "High-performance protein for muscle recovery and growth.",
    link: "https://www.amazon.in/MuscleBlaze-Biozyme-Performance-Certified-servings/dp/B093WQSRHT",
    image:
      "https://img.freepik.com/free-vector/protein-shake-illustration_23-2150010871.jpg",
  },
  {
    name: "Dumbbell",
    description:
      "Durable rubber-encased dumbbell for versatile strength training.",
    link: "https://www.amazon.in/AmazonBasics-Rubber-Encased-Dumbbell-Weight/dp/B0CHJ5HR25",
    image:
      "https://img.freepik.com/free-psd/top-view-dumbbells-isolated_23-2151849404.jpg",
  },
  {
    name: "Banana",
    description:
      "Fresh Yelakki bananas rich in potassium, perfect for snacks and smoothies.",
    link: "https://www.bigbasket.com/pd/40324709/fresho-banana-yelakki-250-g/",
    image:
      "https://img.freepik.com/premium-photo/condom-banana-yellow-background_185193-129962.jpg",
  },
];

function Store() {
  return (
    <div className="store-container">
      <h1 className="store-title">Fitness Store</h1>
      <div className="product-grid">
        {products.map((product, index) => (
          <div className="product-card" key={index}>
            <img
              src={product.image}
              alt={product.name}
              className="product-image"
            />
            <div className="product-details">
              <h2 className="product-name">{product.name}</h2>
              <p className="product-description">{product.description}</p>
              <a
                href={product.link}
                target="_blank"
                rel="noopener noreferrer"
                className="product-link"
              >
                View Product
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Store;
