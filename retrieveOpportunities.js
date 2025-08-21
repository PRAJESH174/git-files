function retrieveOpportunities() {
    // Use CRM Web API to retrieve opportunities
    var apiUrl = Xrm.Utility.getGlobalContext().getClientUrl() + "/api/data/v9.1/opportunities";

    // Make a request to get the user's business unit and team information
    var userId = Xrm.Utility.getGlobalContext().userSettings.userId;
    var userApiUrl = apiUrl + "/systemusers(" + userId.slice(1, -1) + ")?$expand=teammembership_association($select=teamid)";

    // Execute the request to get user information
    Xrm.WebApi.retrieveRecord("systemuser", userId, "?$expand=teammembership_association($select=teamid)")
        .then(function (userResponse) {
            // Extract user's teams
            var userTeams = userResponse.teammembership_association.map(function (team) {
                return team.teamid;
            });

            // Make a request to get opportunities based on user's teams
            var opportunitiesUrl = apiUrl + "/opportunities?$filter=owningteam/any(t: t/teamid in (" + userTeams.join(",") + "))";

            // Execute the request to get opportunities
            Xrm.WebApi.retrieveMultipleRecords("opportunity", "?$filter=owningteam/any(t: t/teamid in (" + userTeams.join(",") + "))")
                .then(function (opportunityResponse) {
                    // Process the retrieved opportunities
                    var opportunities = opportunityResponse.entities;
                    // Do something with the opportunities
                    console.log(opportunities);
                })
                .fail(function (error) {
                    // Handle the error
                    console.error(error.message);
                });
        })
        .fail(function (error) {
            // Handle the error
            console.error(error.message);
        });
}
