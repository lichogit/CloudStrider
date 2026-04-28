using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SneakerShop.Data;
using System.Threading.Tasks;
using SneakerShop.Models;

namespace SneakerShop.Controllers
{
    
    [Authorize(Roles = "Admin")]
    public class AdminController : Controller
    {
        private readonly ApplicationDbContext _context;

        public AdminController(ApplicationDbContext context)
        {
            _context = context;
        }

        // Dashboard Home: Lists all the sneakers
        public async Task<IActionResult> Index()
        {
            var products = await _context.Products.ToListAsync();
            return View(products);
        }

        // 1. GET: Shows the empty form
        [HttpGet]
        public IActionResult Create()
        {
            return View(new Product());
        }

        // 2. POST: Receives the form data and saves it to the database
        [HttpPost]
        [ValidateAntiForgeryToken] // Protects against cross-site request forgery hacks
        public async Task<IActionResult> Create(Product product)
        {
            if (ModelState.IsValid)
            {
                // Add the new shoe to the database blueprint
                _context.Products.Add(product);
                
                // Save the changes directly to SQL Server
                await _context.SaveChangesAsync();
                
                // Send the admin back to the dashboard
                return RedirectToAction(nameof(Index));
            }
            
            // If something was missing (like price), return the form to show errors
            return View(product);
        }
        // --- EDIT SNEAKER ---
        [HttpGet]
        public async Task<IActionResult> Edit(int? id)
        {
            if (id == null) return NotFound();
            var product = await _context.Products.FindAsync(id);
            if (product == null) return NotFound();
            return View(product);
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> Edit(int id, Product product)
        {
            if (id != product.Id) return NotFound();

            if (ModelState.IsValid)
            {
                _context.Update(product);
                await _context.SaveChangesAsync();
                return RedirectToAction(nameof(Index));
            }
            return View(product);
        }

        // --- DELETE SNEAKER ---
        [HttpGet]
        public async Task<IActionResult> Delete(int? id)
        {
            if (id == null) return NotFound();
            var product = await _context.Products.FirstOrDefaultAsync(m => m.Id == id);
            if (product == null) return NotFound();
            return View(product);
        }

        [HttpPost, ActionName("Delete")]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> DeleteConfirmed(int id)
        {
            var product = await _context.Products.FindAsync(id);
            if (product != null)
            {
                _context.Products.Remove(product);
                await _context.SaveChangesAsync();
            }
            return RedirectToAction(nameof(Index));
        }
    }
    
}