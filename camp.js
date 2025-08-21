// Auto-populate company name field on Contact form based on selected Account
async function contactdetails(executionContext) {
    try {
        var formContext = executionContext.getFormContext();
        var accountLookup = formContext.getAttribute("parentcustomerid")?.getValue();

        // If no account is selected, clear the company name field
        if (!accountLookup?.length) {
            formContext.getAttribute("kp_companyname")?.setValue(null); // Adjust field name if needed
            return;
        }

        var accountId = accountLookup[0].id.replace(/[{}]/g, "");

        // Fetch the account name
        const account = await Xrm.WebApi.retrieveRecord("account", accountId, "?$select=name");

        // Set the account name into the custom company name field on the contact form
        if (account?.name) {
            formContext.getAttribute("kp_companyname")?.setValue(account.name); // Adjust field name if needed
        }

    } catch (error) {
        console.error("Error in contactdetails:", error.message);
    }
}

