using Microsoft.AspNetCore.Mvc;
using SneakerShop.Data;
using SneakerShop.Models;
using SneakerShop.Helpers;

namespace SneakerShop.Controllers
{
    public class CartController : Controller
    {
        private readonly ApplicationDbContext _context;
        public CartController(ApplicationDbContext context) => _context = context;

// a session-based cart that stores a list of CartItem objects, which include the product, quantity, and size. 
        public IActionResult Index()
        {
            var cart = HttpContext.Session.Get<List<CartItem>>("Cart") ?? new List<CartItem>();
            return View(cart);
        }

        [HttpPost]
        public IActionResult AddToCart(int id, string size)
        {
            if (string.IsNullOrEmpty(size)) size = "Standard";

            var product = _context.Products.Find(id);
            if (product != null)
            {
                var cart = HttpContext.Session.Get<List<CartItem>>("Cart") ?? new List<CartItem>();
                
                var existingItem = cart.FirstOrDefault(c => c.Product.Id == id && c.Size == size);
                
                if (existingItem != null) existingItem.Quantity++;
                else cart.Add(new CartItem { Product = product, Quantity = 1, Size = size });
                
                HttpContext.Session.Set("Cart", cart);

                //Store a success message in TempData
                TempData["ToastMessage"] = $"{product.Name} (Size: {size}) was added to your cart!";
            }
            
            //  Redirect back to the Product Details page instead of the Cart
            return RedirectToAction("Details", "Home", new { id = id });
        }

public IActionResult RemoveFromCart(int id, string size)
        {
            var cart = HttpContext.Session.Get<List<CartItem>>("Cart") ?? new List<CartItem>();
            
            // Find the exact item matching both the product ID and the selected size
            var itemToRemove = cart.FirstOrDefault(c => c.Product.Id == id && c.Size == size);
            
            if (itemToRemove != null)
            {
                cart.Remove(itemToRemove);
                HttpContext.Session.Set("Cart", cart);
                
                //  Show a toast notification that it was removed
                TempData["ToastMessage"] = $"{itemToRemove.Product.Name} was removed from your cart.";
                TempData.Keep("ToastMessage");
            }

            // Refresh the cart page
            return RedirectToAction("Index");
        }
        public IActionResult Checkout()
        {
            var cart = HttpContext.Session.Get<List<CartItem>>("Cart") ?? new List<CartItem>();
            if (!cart.Any()) return RedirectToAction("Shop", "Home");
            
            return View(cart);
        }

        [HttpPost]
        public IActionResult ProcessCheckout()
        {
            
            HttpContext.Session.Remove("Cart");
            TempData["SuccessMessage"] = "Your order has been placed successfully!";
            return RedirectToAction("Index", "Home");
        }
    }
}