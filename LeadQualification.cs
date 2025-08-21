using Microsoft.Xrm.Sdk;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LeadQualification
{
    public class LeadQualification : IPlugin
    {
        public void Execute(IServiceProvider serviceProvider)
        {
            IPluginExecutionContext context = (IPluginExecutionContext)serviceProvider.GetService(typeof(IPluginExecutionContext));
            if (context.InputParameters.Contains("Target") && context.InputParameters["Target"] is Entity)
            {
                Entity lead = (Entity)context.InputParameters["Target"];
                if (lead.LogicalName == "lead" && lead.Attributes.Contains("budgetamount"))
                {
                    Money budget = (Money)lead["budgetamount"];
                    if (budget.Value > 10000) // Example qualification criteria
                    {
                        lead["statecode"] = new OptionSetValue(1); // Qualified
                        lead["statuscode"] = new OptionSetValue(3); // Example status for qualified
                    }
                }
            }
        }
    }

}
