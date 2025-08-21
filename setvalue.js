function setvalue (exeContext){
    // Get the form context from the execution context
    var formcontext = exeContext.getFormContext();

    // Retrieve the value of the "new_attribute" field
    var attribute = formcontext.getAttribute("new_attribute").getValue();   

    // Check if the attribute value is null or undefined
    if (attribute === null || attribute === undefined) {
        // If the value is empty, set it to "send email"
        formcontext.getAttribute("new_attribute").setValue("send email");
    } else {
        // If the value exists, keep the current value
        formcontext.getAttribute("new_attribute").setValue(attribute);
    }
}