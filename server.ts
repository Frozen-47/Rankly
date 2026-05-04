import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Mock database
  const products = [
    {
      id: "iqoo-z6",
      name: "iQOO Z6",
      price: 14999,
      rating: 4.3,
      specs: {
        ram: "6GB",
        battery: "5000mAh",
        camera: "50MP",
        processor: "Snapdragon 695",
        display: "6.58-inch 120Hz"
      },
      image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?q=80&w=500&auto=format&fit=crop",
      source: "Amazon"
    },
    {
      id: "moto-g62",
      name: "Moto G62",
      price: 15499,
      rating: 4.1,
      specs: {
        ram: "6GB",
        battery: "5000mAh",
        camera: "50MP",
        processor: "Snapdragon 695",
        display: "6.55-inch 120Hz OLED"
      },
      image: "https://images.unsplash.com/photo-1598327105666-5b89351aff97?q=80&w=500&auto=format&fit=crop",
      source: "Flipkart"
    },
    {
      id: "samsung-m33",
      name: "Samsung M33",
      price: 16999,
      rating: 4.2,
      specs: {
        ram: "6GB",
        battery: "6000mAh",
        camera: "50MP",
        processor: "Exynos 1280",
        display: "6.6-inch 120Hz"
      },
      image: "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?q=80&w=500&auto=format&fit=crop",
      source: "Croma"
    },
    {
      id: "poco-x5",
      name: "POCO X5",
      price: 18999,
      rating: 4.4,
      specs: {
        ram: "8GB",
        battery: "5000mAh",
        camera: "48MP",
        processor: "Snapdragon 695",
        display: "6.67-inch Super AMOLED"
      },
      image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?q=80&w=500&auto=format&fit=crop",
      source: "Flipkart"
    },
    {
      id: "realme-10-pro",
      name: "Realme 10 Pro",
      price: 19999,
      rating: 4.5,
      specs: {
        ram: "8GB",
        battery: "5000mAh",
        camera: "108MP",
        processor: "Snapdragon 695",
        display: "6.72-inch 120Hz"
      },
      image: "https://images.unsplash.com/photo-1592890288564-76628a30a657?q=80&w=500&auto=format&fit=crop",
      source: "Amazon"
    }
  ];

  // API Routes
  app.get("/api/products", (req, res) => {
    res.json(products);
  });

  app.get("/api/products/:id", (req, res) => {
    const product = products.find(p => p.id === req.params.id);
    if (product) res.json(product);
    else res.status(404).json({ error: "Product not found" });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
