using System.Web;
using Microsoft.Web.Infrastructure.DynamicModuleHelper;

namespace UmbraComic
{
    public static class FontKillerInitializer
    {
        public static void Initialize()
        {
            DynamicModuleUtility.RegisterModule(typeof(FontKillerModule));
        }
    }

    public class FontKillerModule : IHttpModule
    {
        public void Init(HttpApplication application)
        {
            application.BeginRequest += (source, e) =>
            {
                HttpContext context = application.Context;
                string path = context.Request.Path.ToLower();

                if (!path.Contains("lato") && !path.Contains("opensans")) return;

                context.Response.StatusCode = 404;
                context.Response.End();
            };
        }

        public void Dispose()
        {
        }
    }
}