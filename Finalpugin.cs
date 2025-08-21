using System;
using System.Linq;
using System.Linq.Expressions;
using Microsoft.Xrm.Sdk;
using Microsoft.Xrm.Sdk.Query;

namespace Demo
{
    public class AssignRecordsToTeam : IPlugin
    {
        public void Execute(IServiceProvider serviceProvider)
        {
            // Obtain execution context and retrieve relevant information
            IPluginExecutionContext context = (IPluginExecutionContext)serviceProvider.GetService(typeof(IPluginExecutionContext));
            IOrganizationServiceFactory serviceFactory = (IOrganizationServiceFactory)serviceProvider.GetService(typeof(IOrganizationServiceFactory));
            IOrganizationService service = serviceFactory.CreateOrganizationService(context.InitiatingUserId);

            // Check if the targeted entity matches your requirement
            if (context.InputParameters.ContainsKey("Target") && ((Entity)context.InputParameters["Target"]).LogicalName == "opportunity")
            {
                // Retrieve view ID and fetch details
                if (context.InputParameters.ContainsKey("SavedQueryId") && context.InputParameters["SavedQueryId"] is Guid)
                {
                    Guid savedQueryId = (Guid)context.InputParameters["SavedQueryId"];

                    Entity view = service.Retrieve("savedquery", savedQueryId, new ColumnSet("fetchxml", "teamid"));
                    string fetchXml = view.GetAttributeValue<string>("fetchxml");
                    Guid teamId = view.GetAttributeValue<EntityReference>("teamid").Id;

                    // Implement your team membership logic (replace with your criteria)
                    Guid userId = context.InitiatingUserId;

                    if (IsUserInAuthorizedTeam(userId, teamId, service))
                    {
                        // Assign Opportunity records to the specified team
                        AssignOpportunityRecordsToTeam(fetchXml, teamId, service);
                    }
                    else
                    {
                        throw new InvalidPluginExecutionException("Access denied: User is not in a team authorized to access this view.");
                    }
                }
                else
                {
                    throw new InvalidPluginExecutionException("SavedQueryId parameter is missing or invalid.");
                }
            }
        }

        private bool IsUserInAuthorizedTeam(Guid userId, Guid teamId, IOrganizationService service)
        {
            var query = new QueryExpression("teammembership")
            {
                ColumnSet = new ColumnSet("systemuserid"),
                Criteria = new FilterExpression
                {
                    Conditions =
                    {
                        new ConditionExpression("systemuserid", ConditionOperator.Equal, userId),
                        new ConditionExpression("teamid", ConditionOperator.Equal, teamId)
                    }
                }
            };

            var result = service.RetrieveMultiple(query);
            return result.Entities.Any();
        }

        private void AssignOpportunityRecordsToTeam(string fetchXml, Guid teamId, IOrganizationService service)
        {
            var fetch = new FetchExpression(fetchXml);
            var opportunities = service.RetrieveMultiple(fetch);

            foreach (var opportunity in opportunities.Entities)
            {
                var assignRequest = new AssignRequest
                {
                    Assignee = new EntityReference("team", teamId),
                    Target = opportunity.ToEntityReference()
                };

                service.Execute(assignRequest);
            }
        }
    }
}