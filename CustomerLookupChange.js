function onCustomerLookupChange(executionContext) {
    var formContext = executionContext.getFormContext();
    var customer = formContext.getAttribute("parentcustomerid").getValue(); // Customer lookup

    if (customer && customer[0].entityType === "contact") {
        var contactId = customer[0].id.replace("{", "").replace("}", "");

        // Retrieve the selected contact details using Web API
        Xrm.WebApi.retrieveRecord("contact", contactId, "?$select=firstname,lastname,telephone1,emailaddress1").then(
            function (result) {
                formContext.getAttribute("firstname").setValue(result.firstname || null);
                formContext.getAttribute("lastname").setValue(result.lastname || null);
                formContext.getAttribute("telephone1").setValue(result.telephone1 || null);
                formContext.getAttribute("emailaddress1").setValue(result.emailaddress1 || null);
            },
            function (error) {
                console.log("Error retrieving contact: " + error.message);
            }
        );
    } else {
        // If no contact is selected, clear the fields
        formContext.getAttribute("firstname").setValue(null);
        formContext.getAttribute("lastname").setValue(null);
        formContext.getAttribute("telephone1").setValue(null);
        formContext.getAttribute("emailaddress1").setValue(null);
    }
}
function onLoad(executionContext) {
    var formContext = executionContext.getFormContext();
    formContext.getAttribute("parentcustomerid").addOnChange(onCustomerLookupChange);
    onCustomerLookupChange(executionContext); // Initial call to populate fields if a customer is already selected
}