/**
 * Data validation for Dynamics 365 CRM form before saving the record.
 * Place this code in the form's JavaScript web resource and register the validateForm function on the OnSave event.
 */

function validateForm(executionContext) {
    var formContext = executionContext.getFormContext();
    var isValid = true;
    var errorMessages = [];

    // Example: Validate required fields
    var requiredFields = [
        { name: "firstname", label: "First Name" },
        { name: "lastname", label: "Last Name" },
        { name: "emailaddress1", label: "Email" }
    ];

    requiredFields.forEach(function(field) {
        var value = formContext.getAttribute(field.name)?.getValue();
        if (!value) {
            isValid = false;
            errorMessages.push(field.label + " is required.");
        }
    });

    // Example: Email format validation
    var email = formContext.getAttribute("emailaddress1")?.getValue();
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        isValid = false;
        errorMessages.push("Email format is invalid.");
    }

    // Example: Custom business rule
    var age = formContext.getAttribute("new_age")?.getValue();
    if (age && age < 18) {
        isValid = false;
        errorMessages.push("Age must be at least 18.");
    }

    // Show error and prevent save if not valid
    if (!isValid) {
        formContext.ui.setFormNotification(errorMessages.join(" "), "ERROR", "validationError");
        executionContext.getEventArgs().preventDefault();
    } else {
        formContext.ui.clearFormNotification("validationError");
    }
}