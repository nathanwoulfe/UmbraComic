using System;
using System.Web;

namespace UmbraComic
{
    public class FontKillerModule : IHttpModule
    {
        public void Init(HttpApplication application)
        {
            application.BeginRequest += Application_BeginRequest;
        }

        private static void Application_BeginRequest(object source, EventArgs e)
        {
            var application = (HttpApplication)source;
            HttpContext context = application.Context;

            if (!context.Request.Path.ToLower().Contains("lato")) return;

            context.Response.StatusCode = 404;
            context.Response.End();
        }

        public void Dispose()
        {
        }
    }
}