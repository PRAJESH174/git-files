// This is the OnLoad function you will register on the form's OnLoad event
function onFormLoad(executionContext) {
    setPhoneFieldVisibility(executionContext);
}

// This function controls the visibility of the phone field based on user roles
function setPhoneFieldVisibility(executionContext) {
    // Field schema name to control visibility
    var phoneFieldName = "telephone1"; // Change to another logical name if needed

    // List of security roles allowed to see the phone field
    var allowedRoles = [
        "Standard User" // Add more roles as needed
    ];

    // Get the form context from the execution context
    var formContext = executionContext.getFormContext();

    // Get the current user's roles
    var userRoles = Xrm.Utility.getGlobalContext().userSettings.roles;

    // Default visibility is false (hidden)
    var isPhoneVisible = false;

    // Get the control for the phone field
    var phoneControl = formContext.getControl(phoneFieldName);

    // If control is not found on the form, exit
    if (!phoneControl) {
        console.warn("Phone field '" + phoneFieldName + "' not found on the form.");
        return;
    }

    // Check if any of the user's roles match the allowed roles
    userRoles.forEach(function (role) {
        if (allowedRoles.includes(role.name)) {
            isPhoneVisible = true;
        }
    });

    // Set visibility of the phone field
    phoneControl.setVisible(isPhoneVisible);

    // Log for debugging
    if (isPhoneVisible) {
        console.log("Phone field '" + phoneFieldName + "' is visible to the current user.");
    } else {
        console.log("Phone field '" + phoneFieldName + "' is hidden from the current user.");
    }
}
