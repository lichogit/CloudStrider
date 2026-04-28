using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SneakerShop.Data;

namespace SneakerShop.Controllers
{
    public class HomeController : Controller
    {
        private readonly ApplicationDbContext _context;
        public HomeController(ApplicationDbContext context) => _context = context;

        // UPDATED: The Home Page now fetches 4 "Top Sellers"
        public async Task<IActionResult> Index()
        {
            
            var topSellers = await _context.Products
                .OrderByDescending(p => p.Price)
                .Take(4)
                .ToListAsync();
                
            return View(topSellers);
        }

        // The Catalog Page  handles search and price filtering
        public async Task<IActionResult> Shop(string searchString, decimal? minPrice, decimal? maxPrice)
        {
            
            // Start with a queryable list of all products
            var products = from p in _context.Products select p;

            // 1. Filter by Name or Description
            if (!string.IsNullOrEmpty(searchString))
            {
                products = products.Where(s => s.Name.Contains(searchString) || s.Description.Contains(searchString));
            }

            // 2. Filter by Minimum Price
            if (minPrice.HasValue)
            {
                products = products.Where(p => p.Price >= minPrice.Value);
            }

            // 3. Filter by Maximum Price
            if (maxPrice.HasValue)
            {
                products = products.Where(p => p.Price <= maxPrice.Value);
            }

            // Pass the current search values back to the view so the input fields don't clear out
            ViewData["CurrentFilter"] = searchString;
            ViewData["MinPrice"] = minPrice;
            ViewData["MaxPrice"] = maxPrice;

            

            // Execute the query and return the view
            return View(await products.ToListAsync());
        }

        // Fetches a single product for the Details page
        public async Task<IActionResult> Details(int id)
        {
            var product = await _context.Products.FindAsync(id);
            if (product == null) return NotFound();
            
            return View(product);
        }
    }
}