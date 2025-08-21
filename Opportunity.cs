using System;
using System.Collections.Generic;
using Microsoft.Xrm.Sdk;

namespace Opportunity_Project
{
    public class Opportunity_stage_update : IPlugin
    {
        public void Execute(IServiceProvider serviceProvider)
        {
            // Retrieve the plugin execution context
            IPluginExecutionContext context = (IPluginExecutionContext)serviceProvider.GetService(typeof(IPluginExecutionContext));

            // Use pattern matching to check and cast the "Target" parameter
            if (context.InputParameters.TryGetValue("Target", out var target) && target is Entity opportunity &&
                opportunity.LogicalName == "opportunity" &&
                opportunity.Attributes.TryGetValue("stageid", out var stageIdObj) && stageIdObj is Guid stageId)
            {
                // Example mapping of stage IDs to probabilities
                var stageProbabilityMapping = new Dictionary<Guid, int>
                {
                    { new Guid("00000000-0000-0000-0000-000000000001"), 10 },
                    { new Guid("00000000-0000-0000-0000-000000000002"), 30 },
                    { new Guid("00000000-0000-0000-0000-000000000003"), 60 },
                    { new Guid("00000000-0000-0000-0000-000000000004"), 90 }
                };

                // Check if the current stage ID exists in the mapping and update the probability
                if (stageProbabilityMapping.TryGetValue(stageId, out int probability))
                {
                    opportunity["closeprobability"] = probability;
                }
            }
        }
    }
}

