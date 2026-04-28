using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using SneakerShop.Models;
using System.Security.Claims;
using System.Threading.Tasks;

namespace SneakerShop.Controllers
{
    public class AccountController : Controller
    {
        private readonly SignInManager<ApplicationUser> _signInManager;
        private readonly UserManager<ApplicationUser> _userManager;

        public AccountController(SignInManager<ApplicationUser> signInManager, UserManager<ApplicationUser> userManager)
        {
            _signInManager = signInManager;
            _userManager = userManager;
        }

        // --- GET METHODS (Loads the empty pages) ---
        [HttpGet]
        public IActionResult Login() => View(new LoginViewModel());

        [HttpGet]
        public IActionResult Register() => View(new RegisterViewModel());

        // POST METHODS (Handles the form submissions)
        [HttpPost]
        public async Task<IActionResult> Register(RegisterViewModel model)
        {
            if (ModelState.IsValid)
            {
                var user = new ApplicationUser 
                { 
                    UserName = model.Email, 
                    Email = model.Email, 
                    FirstName = model.FirstName, 
                    LastName = model.LastName,
                    PhoneNumber = model.PhoneNumber
                };
                
                var result = await _userManager.CreateAsync(user, model.Password);
                
                if (result.Succeeded)
                {
                    await _signInManager.SignInAsync(user, isPersistent: false);
                    return RedirectToAction("Index", "Home");
                }
                
                // If password is too weak, add the errors so the page can display them
                foreach (var error in result.Errors)
                {
                    ModelState.AddModelError(string.Empty, error.Description);
                }
            }
            return View(model);
        }

        [HttpPost]
        public async Task<IActionResult> Login(LoginViewModel model, string returnUrl = null)
        {
            if (ModelState.IsValid)
            {
                var result = await _signInManager.PasswordSignInAsync(model.Email, model.Password, isPersistent: false, lockoutOnFailure: false);
                
                if (result.Succeeded)
                {
                    if (!string.IsNullOrEmpty(returnUrl) && Url.IsLocalUrl(returnUrl))
                        return Redirect(returnUrl);
                        
                    return RedirectToAction("Index", "Home");
                }
                
                ModelState.AddModelError(string.Empty, "Invalid login attempt. Please check your email and password.");
            }
            return View(model);
        }

        [HttpPost]
        public async Task<IActionResult> Logout()
        {
            HttpContext.Session.Clear();
            await _signInManager.SignOutAsync();
            return RedirectToAction("Index", "Home");
        }

        // EXTERNAL LOGIN METHODS (Google)
        [HttpPost]
        public IActionResult ExternalLogin(string provider, string returnUrl = null)
        {
            var redirectUrl = Url.Action("ExternalLoginCallback", "Account", new { ReturnUrl = returnUrl });
            var properties = _signInManager.ConfigureExternalAuthenticationProperties(provider, redirectUrl);
            return new ChallengeResult(provider, properties);
        }

        public async Task<IActionResult> ExternalLoginCallback(string returnUrl = null, string remoteError = null)
        {
            if (remoteError != null) 
            {
                ModelState.AddModelError(string.Empty, $"Error from external provider: {remoteError}");
                return View("Login");
            }
            
            var info = await _signInManager.GetExternalLoginInfoAsync();
            if (info == null) 
            {
                
                return RedirectToAction("Login"); 
            }

            // Try to sign in normally (if they've used Google here before)
            var result = await _signInManager.ExternalLoginSignInAsync(info.LoginProvider, info.ProviderKey, isPersistent: false, bypassTwoFactor: true);
            if (result.Succeeded) return RedirectToLocal(returnUrl);

            // If we get here, they haven't used Google on our site before.
            var email = info.Principal.FindFirstValue(ClaimTypes.Email);
            var firstName = info.Principal.FindFirstValue(ClaimTypes.GivenName) ?? "New";
            var lastName = info.Principal.FindFirstValue(ClaimTypes.Surname) ?? "User";

            if (email != null)
            {
                // CHECK: Does a local account with this email already exist?
                var user = await _userManager.FindByEmailAsync(email);
                
                if (user == null)
                {
                    // No account exists, create a brand new one
                    user = new ApplicationUser { UserName = email, Email = email, FirstName = firstName, LastName = lastName };
                    var createResult = await _userManager.CreateAsync(user);
                    if (!createResult.Succeeded) return RedirectToAction("Login"); // Fallback
                }

                // Link the Google ID to the user (whether new or existing)
                await _userManager.AddLoginAsync(user, info);
                
                // Sign them in
                await _signInManager.SignInAsync(user, isPersistent: false);
                return RedirectToLocal(returnUrl);
            }
            
            return RedirectToAction("Login");
        }

        private IActionResult RedirectToLocal(string returnUrl)
        {
            if (!string.IsNullOrEmpty(returnUrl) && Url.IsLocalUrl(returnUrl)) return Redirect(returnUrl);
            return RedirectToAction("Index", "Home");
        }
    }
}