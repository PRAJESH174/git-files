using Microsoft.Xrm.Sdk;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LeadQualificationPlugin
{
    public class LeadQualificationPlugin : IPlugin
    {
        public void Execute(IServiceProvider serviceProvider)
        {
            IPluginExecutionContext context = (IPluginExecutionContext)serviceProvider.GetService(typeof(IPluginExecutionContext));
            if (context.InputParameters.Contains("Target") && context.InputParameters["Target"] is Entity)
            {
                Entity lead = (Entity)context.InputParameters["Target"];
                if (lead.LogicalName == "lead" && lead.Attributes.Contains("revenue"))
                {
                    Money annualRevenue = (Money)lead["revenue"];
                    if (annualRevenue != null && annualRevenue.Value > 50000) // Example qualification criteria based on annual revenue
                    {
                        lead["statecode"] = new OptionSetValue(1); // Qualified
                        lead["statuscode"] = new OptionSetValue(3); // Example status for qualified
                    }
                    else
                    {
                        lead["statecode"] = new OptionSetValue(0); // Open
                        lead["statuscode"] = new OptionSetValue(1); // Example status for open
                    }
                }
            }
        }
    }
}
