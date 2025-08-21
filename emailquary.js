function checkDuplicateContact(executionContext) {
    var formContext = executionContext.getFormContext();
    var email = formContext.getAttribute("emailaddress1").getValue();
    var phone = formContext.getAttribute("telephone1").getValue();

    if (!email && !phone) {
        // No email or phone entered, nothing to check
        return;
    }

    var filter = [];
    if (email) {
        filter.push(`emailaddress1 eq '${email}'`);
    }
    if (phone) {
        filter.push(`telephone1 eq '${phone}'`);
    }
    var filterQuery = filter.join(' or ');

    Xrm.WebApi.retrieveMultipleRecords("contact", `?$select=emailaddress1,telephone1&$filter=${filterQuery}`)
        .then(function (result) {
            if (result.entities && result.entities.length > 0) {
                formContext.ui.setFormNotification(
                    "A contact with this email or phone number already exists.",
                    "ERROR",
                    "duplicateCheck"
                );
            } else {
                formContext.ui.clearFormNotification("duplicateCheck");
                // Proceed with your logic for creating/updating the contact
            }
        })
        .catch(function (error) {
            formContext.ui.setFormNotification(
                "Error checking for duplicates: " + error.message,
                "ERROR",
                "duplicateCheck"
            );
        });
}