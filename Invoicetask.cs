using System;
using Microsoft.Xrm.Sdk;

namespace Invoice_task
{
    public class Invoicetask : IPlugin
    {
        public void Execute(IServiceProvider serviceProvider)
        {
            IPluginExecutionContext context = (IPluginExecutionContext)serviceProvider.GetService(typeof(IPluginExecutionContext)); 
            IOrganizationServiceFactory serviceFactory = (IOrganizationServiceFactory)serviceProvider.GetService(typeof(IOrganizationServiceFactory));
            IOrganizationService service = serviceFactory.CreateOrganizationService(context.UserId);
            ITracingService tracingService = (ITracingService)serviceProvider.GetService(typeof(ITracingService));

            try
            {
                if (context.InputParameters.Contains("Target") && context.InputParameters["Target"] is Entity)
                {
                    Entity invoice = (Entity)context.InputParameters["Target"];

                    // Only run on create
                    if (context.MessageName != "Create")
                        return;

                    // Create a related task
                    Entity task = new Entity("task");
                    task["subject"] = "Follow up on Invoice";
                    task["description"] = "Please follow up with the customer regarding the new invoice.";
                    task["scheduledend"] = DateTime.Now.AddDays(7);

                    // Relate the task to the invoice
                    if (invoice.Id != Guid.Empty)
                    {
                        task["regardingobjectid"] = new EntityReference(invoice.LogicalName, invoice.Id);
                    }

                    service.Create(task);
                }
            }
            catch (Exception ex)
            {
                tracingService.Trace("Invoicetask Plugin Error: {0}", ex.ToString());
                throw new InvalidPluginExecutionException("An error occurred in the Invoicetask plugin.", ex);
            }
        }
    }
}