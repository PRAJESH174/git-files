function showhidesection(executionContext) {
    var formContext = executionContext.getFormContext();
    
    // Get the field value
    var preferredContactMethodAttr = formContext.getAttribute("preferredcontactmethodcode");
    var preferredContactMethod = preferredContactMethodAttr ? preferredContactMethodAttr.getValue() : null;

    // Get the section
    var section = formContext.ui.tabs.get("DETAILS_TAB").sections.get("SHIPPING");

    // Default to hiding the section if field is null
    if (preferredContactMethod === 3) {
        section.setVisible(true);
    } else {
        section.setVisible(false);
    }
}
function onLoad(executionContext) {
    var formContext = executionContext.getFormContext();
    
    // Register the event handler for the field
    var preferredContactMethodAttr = formContext.getAttribute("preferredcontactmethodcode");
    if (preferredContactMethodAttr) {
        preferredContactMethodAttr.addOnChange(showhidesection);
    }

    // Call the function to set the initial visibility of the section
    showhidesection(executionContext);
}