using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using SneakerShop.Models;

namespace SneakerShop.Data
{
    //  inherit from IdentityDbContext
    public class ApplicationDbContext : IdentityDbContext<ApplicationUser> 
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options) { }

        public DbSet<Product> Products { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            // This tells IdentityDbContext to build the security tables
            base.OnModelCreating(modelBuilder); 

            // Rotating placeholder images for a clean UI
            string img1 = "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600";
            string img2 = "https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=600";
            string img3 = "https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?w=600";
            string img4 = "https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?w=600";
            string img5 = "https://images.unsplash.com/photo-1560769629-975ec94e6a86?w=600";
            string img6 = "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=600";

            modelBuilder.Entity<Product>().HasData(
                new Product { Id = 1, Name = "Air Max Retro", Description = "Classic 90s comfort.", Price = 130.00m, ImageUrl = img1 },
                new Product { Id = 2, Name = "Boost Runner", Description = "High performance knit.", Price = 180.00m, ImageUrl = img2 },
                new Product { Id = 3, Name = "Court Classic", Description = "Minimalist leather sneaker.", Price = 110.00m, ImageUrl = img3 },
                new Product { Id = 4, Name = "Dunk Low Panda", Description = "Everyday streetwear staple.", Price = 120.00m, ImageUrl = img4 },
                new Product { Id = 5, Name = "Yeezy 350 V2", Description = "Primeknit comfort and style.", Price = 230.00m, ImageUrl = img5 },
                new Product { Id = 6, Name = "Jordan 1 High", Description = "The one that started it all.", Price = 180.00m, ImageUrl = img6 },
                new Product { Id = 7, Name = "NB 550 Vintage", Description = "Retro hoops silhouette.", Price = 110.00m, ImageUrl = img1 },
                new Product { Id = 8, Name = "Ultraboost 1.0", Description = "Maximum energy return.", Price = 190.00m, ImageUrl = img2 },
                new Product { Id = 9, Name = "RS-X Toys", Description = "Chunky retro-future design.", Price = 115.00m, ImageUrl = img3 },
                new Product { Id = 10, Name = "Gel-Lyte III", Description = "Split tongue classic.", Price = 130.00m, ImageUrl = img4 },
                new Product { Id = 11, Name = "Club C 85", Description = "Clean tennis aesthetics.", Price = 85.00m, ImageUrl = img5 },
                new Product { Id = 12, Name = "Chuck 70 High", Description = "Upgraded canvas icon.", Price = 90.00m, ImageUrl = img6 },
                new Product { Id = 13, Name = "Old Skool Pro", Description = "Skate ready durability.", Price = 75.00m, ImageUrl = img1 },
                new Product { Id = 14, Name = "Air Force 1 '07", Description = "Crisp white leather.", Price = 115.00m, ImageUrl = img2 },
                new Product { Id = 15, Name = "XT-6 Trail", Description = "Off-road performance.", Price = 200.00m, ImageUrl = img3 },
                new Product { Id = 16, Name = "Air Max 97", Description = "Water ripple inspired.", Price = 175.00m, ImageUrl = img4 },
                new Product { Id = 17, Name = "Samba OG", Description = "Indoor soccer legend.", Price = 100.00m, ImageUrl = img5 },
                new Product { Id = 18, Name = "NB 2002R", Description = "Y2K running style.", Price = 140.00m, ImageUrl = img6 },
                new Product { Id = 19, Name = "Blazer Mid '77", Description = "Vintage hoops design.", Price = 105.00m, ImageUrl = img1 },
                new Product { Id = 20, Name = "Jordan 4 Retro", Description = "Flight club essential.", Price = 210.00m, ImageUrl = img2 },
                new Product { Id = 21, Name = "Gazelle Indoor", Description = "Suede perfection.", Price = 120.00m, ImageUrl = img3 },
                new Product { Id = 22, Name = "Suede Classic", Description = "B-boy certified.", Price = 75.00m, ImageUrl = img4 },
                new Product { Id = 23, Name = "Sk8-Hi", Description = "Ankle support for days.", Price = 80.00m, ImageUrl = img5 },
                new Product { Id = 24, Name = "Kayano 14", Description = "Tech runner revival.", Price = 150.00m, ImageUrl = img6 },
                new Product { Id = 25, Name = "Clifton 9", Description = "Plush daily trainer.", Price = 145.00m, ImageUrl = img1 },
                new Product { Id = 26, Name = "Cloudmonster", Description = "Maximum cushioning.", Price = 170.00m, ImageUrl = img2 },
                new Product { Id = 27, Name = "Vomero 5", Description = "Breathable mesh overlay.", Price = 160.00m, ImageUrl = img3 },
                new Product { Id = 28, Name = "Jordan 3 Retro", Description = "Elephant print details.", Price = 200.00m, ImageUrl = img4 },
                new Product { Id = 29, Name = "Forum Low", Description = "Strap it down.", Price = 110.00m, ImageUrl = img5 },
                new Product { Id = 30, Name = "NB 990v6", Description = "Made in USA excellence.", Price = 200.00m, ImageUrl = img6 },
                new Product { Id = 31, Name = "Run Star Hike", Description = "Chunky platform style.", Price = 110.00m, ImageUrl = img1 },
                new Product { Id = 32, Name = "Classic Leather", Description = "Timeless everyday wear.", Price = 85.00m, ImageUrl = img2 },
                new Product { Id = 33, Name = "Wave Rider 27", Description = "Smooth transition running.", Price = 140.00m, ImageUrl = img3 }

            );
        }
    }
}