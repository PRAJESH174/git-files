using System;
using System.Collections.Generic;
using Microsoft.Xrm.Sdk;

namespace Opportunity_Probability_Update
{
    public class Opportunity_Probability_Update : IPlugin
    {
        public void Execute(IServiceProvider serviceProvider)
        {
            // Retrieve the plugin execution context
            IPluginExecutionContext context = (IPluginExecutionContext)serviceProvider.GetService(typeof(IPluginExecutionContext));

            // Check if the target entity is an opportunity
            if (context.InputParameters.Contains("Target") && context.InputParameters["Target"] is Entity)
            {
                Entity opportunity = (Entity)context.InputParameters["Target"];
                if (opportunity.LogicalName == "opportunity" && opportunity.Attributes.Contains("stageid"))
                {
                    // Get the current stage ID
                    Guid stageId = (Guid)opportunity["stageid"];

                    // Map stage IDs to probabilities
                    Dictionary<Guid, int> stageProbabilityMapping = new Dictionary<Guid, int>
                    {
                        { new Guid("00000000-0000-0000-0000-000000000001"), 10 },
                        { new Guid("00000000-0000-0000-0000-000000000002"), 30 },
                        { new Guid("00000000-0000-0000-0000-000000000003"), 60 },
                        { new Guid("00000000-0000-0000-0000-000000000004"), 90 }
                    };

                    // Check if the current stage ID is in the mapping
                    if (stageProbabilityMapping.TryGetValue(stageId, out int probability))
                    {
                        // Set the close probability on the opportunity
                        opportunity["closeprobability"] = probability;
                    }
                }
            }
        }
    }
}
