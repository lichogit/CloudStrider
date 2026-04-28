using Microsoft.AspNetCore.Identity;

namespace SneakerShop.Models
{
    public class ApplicationUser : IdentityUser
    {
        // Email and PhoneNumber are already built into IdentityUser
        public string FirstName { get; set; } = string.Empty;
        public string LastName { get; set; } = string.Empty;
    }
}