function alertAccountName(executionContext) {
    // Read the form context
    var formContext = executionContext.getFormContext();

    // Read the account name value
    var accountName = formContext.getAttribute("name").getValue();

    // Read the primary contact lookup value
    var primaryContactLookup = formContext.getAttribute("primarycontactid").getValue();

    // Initialize variables for primary contact details
    var primaryContactName = "";
    var primaryContactId = "";

    // Check if the primary contact lookup is not null
    if (primaryContactLookup && primaryContactLookup.length > 0) {
        primaryContactName = primaryContactLookup[0].name;
        primaryContactId = primaryContactLookup[0].id;
    }

    // Construct the alert message
    var alertMessage = "Welcome " + (accountName || "Unknown Account") + ".";

    if (primaryContactName) {
        alertMessage += " Your primary contact is: " + primaryContactName + " (ID: " + primaryContactId + ").";
    } else {
        alertMessage += " Primary contact information is missing.";
    }

    // Display the alert
    alert(alertMessage);
}
