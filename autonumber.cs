using System;
using Microsoft.Xrm.Sdk;
using Microsoft.Xrm.Sdk.Query;

namespace autonumber
{
    public class AutoNumberPlugin : IPlugin
    {
        public void Execute(IServiceProvider serviceProvider)
        {
            IPluginExecutionContext context = (IPluginExecutionContext)serviceProvider.GetService(typeof(IPluginExecutionContext));
            IOrganizationServiceFactory serviceFactory = (IOrganizationServiceFactory)serviceProvider.GetService(typeof(IOrganizationServiceFactory));
            IOrganizationService service = serviceFactory.CreateOrganizationService(context.UserId);

            if (context.InputParameters.Contains("Target") && context.InputParameters["Target"] is Entity)
            {
                Entity entity = (Entity)context.InputParameters["Target"];

                // Only run on create
                if (context.MessageName != "Create")
                    return;

                // Check if the field is already set
                if (entity.Attributes.Contains("new_autonumber"))
                    return;

                // Generate the next number (simple example: count + 1)
                QueryExpression query = new QueryExpression("new_autonumberentity")
                {
                    ColumnSet = new ColumnSet("new_autonumber"),
                    Orders = { new OrderExpression("createdon", OrderType.Descending) },
                    TopCount = 1
                };

                EntityCollection results = service.RetrieveMultiple(query);
                int nextNumber = 1;
                if (results.Entities.Count > 0)
                {
                    var lastNumber = results.Entities[0].GetAttributeValue<string>("new_autonumber");
                    if (int.TryParse(lastNumber, out int lastInt))
                    {
                        nextNumber = lastInt + 1;
                    }
                }

                // Format the auto number (e.g., "AUTO-0001")
                string autoNumber = $"AUTO-{nextNumber:D4}";
                entity["new_autonumber"] = autoNumber;
            }
        }
    }
}
