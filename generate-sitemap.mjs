import { SitemapStream, streamToPromise } from "sitemap";
import { createWriteStream } from "fs";

// Static pages
const staticPages = [
  "/",
  "/apartments", // optional if you still have a listing page
  "/about",
  "/contact",
  "/faqs",
  "/help",
  "/safety",
];

// Backend endpoint that returns all lodges
const API_URL = "https://lodge.morelinks.com.ng/api/get_all_lodge.php";

// Output sitemap path
const writeStream = createWriteStream("./public/sitemap.xml");

(async () => {
  const sitemap = new SitemapStream({
    hostname: "https://lodge.morelinks.com.ng",
  });

  // Add static pages
  staticPages.forEach((page) => {
    sitemap.write({
      url: page,
      changefreq: "monthly",
      priority: page === "/" ? 1.0 : 0.8,
      lastmod: new Date().toISOString(),
    });
  });

  // Fetch all lodges
  const response = await fetch(API_URL);
  const json = await response.json();

  if (json?.data && Array.isArray(json.data)) {
    json.data.forEach((lodge) => {
      sitemap.write({
        url: `/lodge/${lodge.id}`, // ✅ Updated path
        changefreq: "weekly",
        priority: 0.9,
        lastmod: new Date().toISOString(),
      });
    });
  } else {
    console.warn("⚠️ Could not load lodge list from API.");
  }

  // Finish stream and save
  sitemap.end();
  const xml = await streamToPromise(sitemap);
  writeStream.write(xml.toString());

  console.log("✅ sitemap.xml generated successfully!");
})();
